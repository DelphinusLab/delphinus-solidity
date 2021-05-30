const Web3 = require("web3")
const Config = require("../config")
const Client = require("web3subscriber/client")
const TokenInfo = require("../../build/contracts/Token.json")
const Utils = require("../utils");

async function get_balance(config_name) {
  config = Config[config_name];
  let account = config.monitor_account;
  console.log("Check address balance:", account);
  let web3 = await Client.initWeb3(config, false);
  let token= Client.getContract(web3, config, TokenInfo, account);
  try {
    let balance = await Client.getBalance(token, account);
    console.log("balance is", balance);
  } catch (err) {
    console.log("%s", err);
  }
}

get_balance(process.argv[2]).then(v => {console.log("test done!"); process.exit();});
