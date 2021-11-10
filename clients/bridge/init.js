const Web3 = require("web3");
const Client = require("web3subscriber/src/client");
const Config = require('../config');
const TokenInfo = require("../../build/contracts/Token.json");
const BridgeABI = require("./abi");
const BridgeHelper = require("./bridge");
const Secrets = require('../../.secrets');
const fs = require("fs");
const path = require("path");

const Tokens = require("./tokenlist");

function crunch_tokens() {
  return Tokens.tokenInfo
    .filter((x) => x.address)
    .map((x) =>
      BridgeHelper.encodeL1Address(x.address, parseInt(x.chainId).toString(16))
    );
}

const test_config = {
  l2account:
    "0x7a50c8fa50a39bd48dfd8053ebff44ba3da45dd8c3e90a5fec9fd73a4595251b",
};

async function test_main(config_name) {
  console.log("start calling");
  config = Config[config_name](Secrets);
  try {
    let bridge = await BridgeABI.getBridge(config, false);
    let token = Client.getContract(
      bridge.web3,
      bridge.config,
      TokenInfo,
      bridge.account
    );

    let output = {};
    let index = 4;

    console.log("Testing bridge [id=%s]", bridge.chain_hex_id);
    for (token_uid of crunch_tokens()) {
      console.log("Adding token uid: 0x", token_uid.toString(16));
      let tx = await bridge.addToken(token_uid);
      console.log(tx);

      output[token_uid] = index++;
    }

    fs.writeFileSync(
      path.resolve(__dirname, "..", "token-index.json"),
      JSON.stringify(output, undefined, 2)
    );

    let info = await bridge.getBridgeInfo();
    console.log("bridge info is", info);
    let tokens = await bridge.allTokens();
    console.log("token list is", tokens);
  } catch (err) {
    console.log("%s", err);
  }
}

test_main(process.argv[2]).then((v) => {
  process.exit();
});
