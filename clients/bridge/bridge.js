const Web3 = require("web3")
const BigNumber = Web3.utils.BN;
const Client = require("web3subscriber/client")
const PBinder= require("web3subscriber/pbinder")
const ERC20 = require("../../build/contracts/ERC20.json");
const VERIFIER = require("../../build/contracts/Verifier.json");

function encode_l1address(address_hexstr, chex) {
  let c = new BigNumber(chex + "0000000000000000000000000000000000000000",'hex');
  let a = new BigNumber(address_hexstr,16);
  return c.add(a);
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
    console.log("switch", id_hex, this.chain_hex_id);
    if (id_hex != this.chain_hex_id && this.client_mode == true) {
      try {
        await this.web3.currentProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: this.chain_hex_id }],
        });
      } catch (e) {
/*
        if (e.code == 4902) {
          try {
            console.log("add chain");
            await this.web3.currentProvider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: this.chain_hex_id,
                chainName: this.chain_name,
                rpcUrls: [config.rpc_source],
              }]
            });
            console.log("add chain>>");
            await this.web3.currentProvider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: this.chain_hex_id}]
            });
          } catch (e) {
            throw new Error("IncorrectNetworkId");
          }
        } else {
          throw new Error("IncorrectNetworkId");
        }
*/
      }
    }
    id = await this.web3.eth.net.getId();
    console.log("switched", id_hex, this.chain_hex_id);
    return true;
  }

  async getVerifierInfo (idx) {
    await this.switch_net();
    let vinfo = await this.bridge.methods.getVerifierInfo(idx).call();
    //let vc = Client.getContractByAddress(this.web3, vaddr, VERIFIER, this.account);
    //let vinfo = vc.methods.getVerifierInfo(idx).call();
    return vinfo;
  }

  async createPool(token1, token2) {
    await this.switch_net();
    let pool_id = await this.bridge.methods.createPool(token1, token2).send();
    return pool_id;
  }

  async verify(l2account, calldata, nonce, rid) {
    await this.switch_net();
    var rx = await this.bridge.methods.verify(l2account, calldata, nonce, rid).send();
    return rx;
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

  async balanceOf (l2account, token_id) {
    await this.switch_net();
    let balance = await this.bridge.methods.balanceOf(l2account, token_id).call();
    return balance;
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
}
