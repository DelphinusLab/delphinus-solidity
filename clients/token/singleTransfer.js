const Web3 = require("web3")
const FileSys = require("fs")
const Config = require("../config")
const Client = require("web3subscriber/client")
const PBinder= require("web3subscriber/pbinder")
const TokenInfo = require("../../build/contracts/Token.json")
const RioTokenInfo = require("../../build/contracts/Rio.json")

function test_mint(config_name, tokenType, target0, value0, target1, value1, target2, value2, target3, value3, target4, value4, target5, value5, target6, value6, target7, vlaue7, target8, value8, target9, value9) {
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
      var balance = await Client.getBalance(token, account);
      console.log(account)
      var balance0 = await Client.getBalance(token, target0);
      console.log("balance of sender before transfer:", balance);
      console.log("balance of recipient1 before transfer:", balance0);
      await pbinder.bind("transfer", token.methods.transfer(target0, value0).send());
      balance = await Client.getBalance(token, account);
      balance0 = await Client.getBalance(token, target0);
      console.log("balance of sender after transfer", balance);
      console.log("balance of recipient1 after transfer", balance0);
    } catch (err) {
      console.log("transfer failed: ", err.message);
    }
  });
  return r;
}

test_mint(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6], process.argv[7], process.argv[8], process.argv[9], process.argv[10], process.argv[11], process.argv[12], process.argv[13], process.argv[14], process.argv[15], process.argv[16], process.argv[17], process.argv[18], process.argv[19], process.argv[20], process.argv[21], process.argv[22]).when("transfer","transactionHash", hash=>console.log(hash)).then(v => {console.log("test done!"); process.exit();});
