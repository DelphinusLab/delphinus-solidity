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
    verify_info = await bridge.getVerifierInfo(0);
    console.log("verifier info at zero", verify_info);
  } catch (err) {
    console.log("%s", err);
  }
}

test_main().then(v => console.log("test done!"));
