const Web3 = require("web3")
const FileSys = require("fs")
const Client = require("web3subscriber/src/client");
const Config = require('../config');
const BridgeABI = require('./abi');
const TokenInfo = require("../../build/contracts/Token.json");
const Secrets = require('../../.secrets');

async function test_main(config_name) {
  config = Config[config_name](Secrets);
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
    let metadata = bridge.getMetaData();
    console.log("metadata:", metadata);
    console.log(metadata.bridgeInfo.rid);
  } catch (err) {
    console.log("%s", err);
  }
}

test_main(process.argv[2]).then(v => {process.exit();})
