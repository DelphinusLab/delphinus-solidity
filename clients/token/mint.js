const Web3 = require("web3")
const FileSys = require("fs")
const Config = require("../config")
const Client = require("web3subscriber/client")
const PBinder= require("web3subscriber/pbinder")
const TokenInfo = require("../../build/contracts/Token.json")
const RioTokenInfo = require("../../build/contracts/Rio.json")
function test_mint(config_name, tokenType) {
  let pbinder = new PBinder.PromiseBinder();
  let r = pbinder.return (async () => {
    config = Config[config_name];
    let account = config.monitor_account;
    let web3 = await Client.initWeb3(config, false);
    let token;
    if(tokenType == "token") {
      token= Client.getContract(web3, config, TokenInfo, account);
    } else if(tokenType == "rio") {
      token= Client.getContract(web3, config, RioTokenInfo, account);
    }
    try {
      console.log("mint token:", token.options.address);
      var balance = await Client.getBalance(token, account);
      console.log("balance before mint:", balance, account);
      await pbinder.bind("mint", token.methods.mint(0xf4240).send());
      balance = await Client.getBalance(token, account);
      console.log("balance after mint", balance, account);
    } catch (err) {
      console.log("%s", err);
    }
  });
  return r;
}

/* .once("transactionHash",hash => console.log(hash) */
console.log(Config[process.argv[2]]);
test_mint(process.argv[2], process.argv[3]).when("mint","transactionHash", hash=>console.log(hash)).then(v => {console.log("test done!"); process.exit();});
