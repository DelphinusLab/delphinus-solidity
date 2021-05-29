const Web3 = require("web3")
const BigNumber = Web3.utils.BN;
const Client = require("web3subscriber/client")
const ERC20 = require("../../build/contracts/ERC20.json");
const VERIFIER = require("../../build/contracts/Verifier.json");

class Bridge {

  constructor(web3, config, bridge, account, chain_hex){
    this.web3 = web3;
    this.config = config;
    this.account = account;
    this.bridge = bridge;
    this.chain_hex_id = chain_hex;
  }

  /* address must start with 0x */
  encode_l1address(address) {
    console.assert(address.substring(0,2) == "0x");
    //160 bits for erc20 address
    let c = new BigNumber(this.chain_hex_id + "0000000000000000000000000000000000000000",'hex');
    let a = new BigNumber(address.substring(2),16);
    return c.add(a);
  }

  async check_net_id() {
    let id = await this.web3.eth.net.getId();
    if (id != this.chain_hex_id) {
      throw new Error("Incorrect net id");
    }
    return true;
  }

  async getVerifierInfo (idx) {
    let vinfo = await this.bridge.methods.getVerifierInfo(idx).call();
    //let vc = Client.getContractByAddress(this.web3, vaddr, VERIFIER, this.account);
    //let vinfo = vc.methods.getVerifierInfo(idx).call();
    return vinfo;
  }

  async createPool(token1, token2) {
    let pool_id = await this.bridge.methods.createPool(token1, token2).send();
    return pool_id;
  }

  async verify(l2account, calldata, nonce, rid) {
    var rx = await this.bridge.methods.verify(l2account, calldata, nonce, rid).send();
    return rx;
  }

  async deposit (token_address, amount, l2account) {
    let token = Client.getContractByAddress(this.web3, token_address, ERC20, this.account);
    var rx = await token.methods.approve(this.bridge.options.address, amount).send();
    rx = await this.bridge.methods.deposit(token_address, amount, l2account).send();
    return rx;
  }

  async balanceOf (l2account, token_address) {
    let token_id = this.encode_l1address(token_address);
    let balance = await this.bridge.methods.balanceOf(l2account, token_id).call();
    return balance;
  }
}

async function getBridgeClient(config, bridge, client_mode) {
  let web3 = await Client.initWeb3(config, client_mode);
  let netid = await web3.eth.net.getId();
  if (netid != config.device_id) {
    throw (new Error("UnmatchedNetworkId"));
  }
  let account = await Client.getDefaultAccount(web3, config);
  var bridge = Client.getContract(web3, config, bridge, account);
  let chain_id = await bridge.methods.chainID().call();
  let chain_hex = (new BigNumber(chain_id)).toString(16);
  bridge = new Bridge(web3, config, bridge, account, chain_hex);
  return bridge;
}

module.exports = {
  getBridgeClient: getBridgeClient,
}