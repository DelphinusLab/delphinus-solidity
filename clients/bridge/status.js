const Web3 = require("web3")
const FileSys = require("fs")
const Client = require("web3subscriber/client");
const EthConfig = require('../config');
const BridgeABI = require('./abi');
const TokenInfo = require("../../build/contracts/Token.json");

const test_config = {
  l2account: "0x7a50c8fa50a39bd48dfd8053ebff44ba3da45dd8c3e90a5fec9fd73a4595251b",
}

async function test_main(config_name) {
  console.log("start calling");
  config = EthConfig[config_name];
  try {
    let bridge = await BridgeABI.getBridge(config, false);
    let token = Client.getContract(bridge.web3, bridge.config,
                TokenInfo, bridge.account);

    console.log("Testing bridge [id=%s]", bridge.chain_hex_id);

    let l1account = bridge.encode_l1address(bridge.account);
    let token_address = token.options.address;
    let token_id = bridge.encode_l1address(token_address);
    console.log("token id is", token_id.toString(16));
    let bridge_address = bridge.bridge.options.address;
    let balance = await token.methods.balanceOf(bridge.account).call();
    console.log("balance is", balance);
    balance = await bridge.balanceOf(test_config.l2account, token_address);
    console.log("balance in bridge is", balance);
  } catch (err) {
    console.log("%s", err);
  }
}

test_main(process.argv[2]).then(v => {process.exit();})
