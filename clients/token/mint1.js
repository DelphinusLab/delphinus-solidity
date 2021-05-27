const Web3 = require("web3")
const FileSys = require("fs")
const Config = require("../config1")
const Client = require("web3subscriber/client")
const TokenInfo = require("../../build/contracts/Token.json")


async function test_mint() {
  let account = Config.monitor_account;
  let web3 = await Client.initWeb3(Config, false);
  let token= Client.getContract(web3, Config, TokenInfo, account);
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

test_mint().then(v => {console.log("test done!"); process.exit();});
