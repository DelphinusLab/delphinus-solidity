const Web3 = require("web3")
const Config = require("../config")
const Client = require("web3subscriber/client")
const TokenInfo = require("../../build/contracts/Token.json")
const RioTokenInfo = require("../../build/contracts/Rio.json")
const Utils = require("../utils");

async function get_balance(config_name, tokenType, account1) {
  config = Config[config_name];
  let account = config.monitor_account;
  console.log("Check address balance:", account);
  if(account1) {
    account = account1;
  }
  let web3 = await Client.initWeb3(config, false);
  let token;
  if(tokenType == "token") {
    token= Client.getContract(web3, config, TokenInfo, account);
  } else if(tokenType == "rio") {
    token= Client.getContract(web3, config, RioTokenInfo, account);
  }
  try {
    let balance = await Client.getBalance(token, account);
    console.log("balance is", balance, account);
  } catch (err) {
    console.log("%s", err);
  }
}

get_balance(process.argv[2], process.argv[3]).then(v => {console.log("test done!"); process.exit();});
