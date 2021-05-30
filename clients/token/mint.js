const Web3 = require("web3")
const FileSys = require("fs")
const Config = require("../config")
const Client = require("web3subscriber/client")
const TokenInfo = require("../../build/contracts/Token.json")


async function test_mint(config_name) {
  config = Config[config_name];
  let account = config.monitor_account;
  let web3 = await Client.initWeb3(config, false);
  let token= Client.getContract(web3, config, TokenInfo, account);
  try {
    var balance = await Client.getBalance(token, account);
    console.log("balance before mint:", balance);
    await token.methods.mint(0x100).send();
    balance = await Client.getBalance(token, account);
    console.log("balance after mint", balance);
  } catch (err) {
    console.log("%s", err);
  }
}


console.log(Config[process.argv[2]]);
test_mint(process.argv[2]).then(v => {console.log("test done!"); process.exit();});
