const Web3 = require("web3")
const FileSys = require("fs")
const Config = require("../config")
const Client = require("web3subscriber/client")
const PBinder= require("web3subscriber/pbinder")
//const TokenInfo = require("../../build/contracts/Token.json")
const TokenInfo = require("../../build/contracts/Rio.json")

function test_mint(config_name) {
  let pbinder = new PBinder.PromiseBinder();
  let r = pbinder.return (async () => {
    config = Config[config_name];
    let account = config.monitor_account;
    let web3 = await Client.initWeb3(config, false);
    let token= Client.getContract(web3, config, TokenInfo, account);
    try {
      var balance = await Client.getBalance(token, account);
      console.log("balance before mint:", balance);
      await pbinder.bind("mint", token.methods.mint(0x100).send());
      balance = await Client.getBalance(token, account);
      console.log("balance after mint", balance);
    } catch (err) {
      console.log("%s", err);
    }
  });
  return r;
}

/* .once("transactionHash",hash => console.log(hash) */
console.log(Config[process.argv[2]]);
test_mint(process.argv[2]).when("mint","transactionHash", hash=>console.log(hash)).then(v => {console.log("test done!"); process.exit();});
