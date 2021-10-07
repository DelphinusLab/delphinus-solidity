const Web3 = require("web3")
const BigNumber = Web3.utils.BN;
const Client = require("web3subscriber/client")
const PBinder= require("web3subscriber/pbinder")
const ERC20 = require("../../build/contracts/ERC20.json");
const VERIFIER = require("../../build/contracts/Verifier.json");

const L1ADDR_BITS = 160;
const Tokens = require("./tokenlist");

function hexcmp(x, y) {
  const xx = new BigNumber(x,'hex');
  const yy = new BigNumber(y,'hex');
  return xx.eq(yy);
}

function encode_l1address(address_hexstr, chex) {
  let c = new BigNumber(chex + "0000000000000000000000000000000000000000",'hex');
  let a = new BigNumber(address_hexstr,16);
  return c.add(a);
}

/* chain_id:dec * address:hex
 */
function decode_l1address(l1address) {
  let uid = new BigNumber(l1address);
  let chain_id = uid.shrn(L1ADDR_BITS);
  let address_hex = uid.sub(chain_id.shln(L1ADDR_BITS)).toString(16);
  let chain_hex= chain_id.toString(10);
  return [chain_hex, address_hex];
}

function extract_chain_info(all_tokens) {
  let valid_tokens = all_tokens.filter(t=>t.token_uid != '0');
  valid_tokens = valid_tokens.map(token => {
      let [cid, address] = decode_l1address(token.token_uid);
      return {
        chainId: cid,
        name: Tokens.tokenInfo.find(x=>
            hexcmp(x.address,address)
            && x.chainId == x.chainId
            && x.chainId == cid
        )?.name || "unknown",
        address: address,
      }
  });
  let chain_list = Array.from(new Set(valid_tokens.map(x => x.chainId)));
  let token_list = chain_list.map(chain_id => ({
    chainId: chain_id,
    chainName: Tokens.chainInfo[chain_id],
    tokens: valid_tokens.filter(x => x.chainId == chain_id)
  }));
  return token_list;
}

class Bridge {

  constructor(web3, config, account, bridge_info, chain_hex, client_mode) {
    this.web3 = web3;
    this.config = config;
    this.chain_hex_id = chain_hex;
    this.client_mode = client_mode;
    this.account = account;
    this.chain_name = config.chain_name;
  }

  async init(web3, config, account, bridge_info) {
    await this.switch_net();
    this.bridge = Client.getContract(web3, config, bridge_info, account);
    console.log(`init_bridge on %s`, this.chain_name);
    const bi = await this.getBridgeInfo();
    const tokens = await this.allTokens();
    this.metadata = {
        bridgeInfo: bi,
        tokens: tokens,
        chainInfo: extract_chain_info(tokens)
    }
  }

  getTokenInfo(idx) {
    const token = this.metadata.tokens[idx];
    let [cid, addr] = decode_l1address(token.token_uid);
    return {
      chainId: cid,
      chainName: Tokens.chainInfo[cid],
      tokenAddress: addr,
      tokenName: Tokens.tokenInfo.find(x=>
            hexcmp(x.address,addr)
            && x.chainId == cid
        )?.name || "unknown",
    }
  }


  /* address must start with 0x */
  encode_l1address(address) {
    console.assert(address.substring(0,2) == "0x");
    let address_hex = address.substring(2);
    let chex = this.chain_hex_id.substring(2);
    return encode_l1address(address_hex, chex);
  }

  async switch_net() {
    let id = await this.web3.eth.net.getId();
    let id_hex = "0x" + (new BigNumber(id)).toString(16);
    console.log("switch chain", id_hex, this.chain_hex_id);
    if (id_hex != this.chain_hex_id && this.client_mode == true) {
      try {
        await this.web3.currentProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: this.chain_hex_id }],
        });
      } catch (e) {
        if (e.code == 4902) {
          try {
            await this.web3.currentProvider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: this.chain_hex_id,
                chainName: this.chain_name,
                rpcUrls: [this.config.rpc_source]
              }]
            });
            await this.web3.currentProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: this.chain_hex_id}]
            });
          } catch (e) {
            throw new Error("Add Network Rejected by User.");
          }
        } else {
          throw new Error("Can not switch to chain " + this.chain_hex_id);
        }
      }
    }
    id = await this.web3.eth.net.getId();
    console.log("switched", id_hex, this.chain_hex_id);
    return true;
  }

  async getBridgeInfo () {
    await this.switch_net();
    let vinfo = await this.bridge.methods.getBridgeInfo().call();
    return vinfo;
  }

  async allTokens () {
    await this.switch_net();
    let vinfo = await this.bridge.methods.allTokens().call();
    return vinfo;
  }

  async addToken(tokenid) {
    await this.switch_net();
    let tx = await this.bridge.methods.addToken(tokenid).send();
    return tx;
  }

  getMetaData() {
    return this.metadata;
  }

  verify(l2account, calldata, verifydata, vid, nonce, rid) {
    let pbinder = new PBinder.PromiseBinder();
    let r = pbinder.return(async () => {
      await this.switch_net();
      let rx = await pbinder.bind("Verify",
        this.bridge.methods.verify(l2account, calldata,
            verifydata, vid, nonce, rid).send()
      );
      return rx;
    });
    console.log(r);
    return r;
  }

  deposit (token_address, amount, l2account) {
    let pbinder = new PBinder.PromiseBinder();
    let r = pbinder.return(async () => {
      let c = await this.switch_net();
      let token = Client.getContractByAddress(this.web3, token_address, ERC20, this.account);
      pbinder.snapshot("Approve");
      var rx = await pbinder.bind("Approve",
        token.methods.approve(this.bridge.options.address, amount).send()
      );
      pbinder.snapshot("Deposit");
      rx = await pbinder.bind("Deposit",
        this.bridge.methods.deposit(token_address, amount, l2account).send()
      );
      return rx;
    });
    return r;
  }
}

async function getBridgeClient(config, bridge_info, client_mode) {
  let web3 = await Client.initWeb3(config, client_mode);
  let chain_id = config.device_id;
  let chain_hex = "0x" + (new BigNumber(chain_id)).toString(16);
  let account = await Client.getDefaultAccount(web3, config);
  bridge = new Bridge(web3, config, account, bridge_info, chain_hex, client_mode);
  await bridge.init(web3, config, account, bridge_info);
  return bridge;
}

module.exports = {
  getBridgeClient: getBridgeClient,
  encodeL1Address: encode_l1address,
  decodeL1Address: decode_l1address,
}
