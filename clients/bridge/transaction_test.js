const Web3 = require("web3")
const FileSys = require("fs")
const Client = require("web3subscriber/client");
const EthConfig = require('../config');
const BridgeABI = require('./abi');
const TokenInfo = require("../../build/contracts/Token.json");

const test_config = {
  l2account: "0x7a50c8fa50a39bd48dfd8053ebff44ba3da45dd8c3e90a5fec9fd73a4595251b",
}

async function test_main() {
  console.log("start calling");
  try {

    let bridge = await BridgeABI.getBridge(false, "0x10");
    let token = Client.getContract(bridge.web3, bridge.config,
                TokenInfo, bridge.account);

    console.log("Testing bridge [id=%s]", bridge.chain_hex_id);

    let l1account = bridge.encode_l1address(bridge.account);
    let token_address = token.options.address;
    let token_id = bridge.encode_l1address(token_address);
    let bridge_address = bridge.bridge.options.address;

    let balance = await token.methods.balanceOf(bridge.account).call();
    console.log("balance is", balance);
    console.log("token id is", token_id.toString(16));
    balance = await bridge.balanceOf(test_config.l2account, token_address);
    console.log("balance in bridge is", balance);

    console.log("test deposit...");
    //await bridge.deposit(token_address, 0x1c, test_config.l2account);

    //console.log("test withdraw...");
    //rx = await bridge.methods.withdraw(l2account, token_address, 0x4c, l1account).send();
    //balance = await bridge.methods.balanceOf(l2account, token_id).call();
    //console.log("balance in bridge is", balance);

    //console.log("test swap...");
    //rx = await bridge.methods.swap(l2account, token_id, token_id,  0x10);
  } catch (err) {
    console.log("%s", err);
  }
}

test_main().then(v => console.log("test done!"));
