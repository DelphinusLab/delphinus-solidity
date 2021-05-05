const Web3 = require("web3")
const Config = require("../config")
const Client = require("web3subscriber/client")
const TokenInfo = require("../../build/contracts/Token.json")
const BridgeInfo = require("../../build/contracts/Bridge.json");
const Utils = require("../utils");

async function get_balance() {
  console.log("Check address balance:");
  let web3 = await Client.initWeb3(Config, false);
  let account = Config.monitor_account;
  let token= Client.getContract(web3, Config, TokenInfo, account);
  try {
    let balance = await Client.getBalance(token, account);
    console.log("balance is", balance);
  } catch (err) {
    console.log("%s", err);
  }
}

get_balance().then(v => {console.log("test done!"); process.exit();});
