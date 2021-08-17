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
      var balance0 = await Client.getBalance(token, target0);
      var balance1 = await Client.getBalance(token, target1);
      var balance2 = await Client.getBalance(token, target2);
      var balance3 = await Client.getBalance(token, target3);
      var balance4 = await Client.getBalance(token, target4);
      var balance5 = await Client.getBalance(token, target5);
      var balance6 = await Client.getBalance(token, target6);
      var balance7 = await Client.getBalance(token, target7);
      var balance8 = await Client.getBalance(token, target8);
      var balance9 = await Client.getBalance(token, target9);
      console.log("balance of sender before transfer:", balance);
      console.log("balance of recipient1 before transfer:", balance0);
      console.log("balance of recipient2 before transfer:", balance1);
      console.log("balance of recipient3 before transfer:", balance2);
      console.log("balance of recipient4 before transfer:", balance3);
      console.log("balance of recipient5 before transfer:", balance4);
      console.log("balance of recipient6 before transfer:", balance5);
      console.log("balance of recipient7 before transfer:", balance6);
      console.log("balance of recipient8 before transfer:", balance7);
      console.log("balance of recipient9 before transfer:", balance8);
      console.log("balance of recipient10 before transfer:", balance9);
      await pbinder.bind("transfer", token.methods.transfer(target0, value0).send());
      await pbinder.bind("transfer", token.methods.transfer(target1, value1).send());
      await pbinder.bind("transfer", token.methods.transfer(target2, value2).send());
      await pbinder.bind("transfer", token.methods.transfer(target3, value3).send());
      await pbinder.bind("transfer", token.methods.transfer(target4, value4).send());
      await pbinder.bind("transfer", token.methods.transfer(target5, value5).send());
      await pbinder.bind("transfer", token.methods.transfer(target6, value6).send());
      await pbinder.bind("transfer", token.methods.transfer(target7, value7).send());
      await pbinder.bind("transfer", token.methods.transfer(target8, value8).send());
      await pbinder.bind("transfer", token.methods.transfer(target9, value9).send());
      balance = await Client.getBalance(token, account);
      balance0 = await Client.getBalance(token, target0);
      balance1 = await Client.getBalance(token, target1);
      balance2 = await Client.getBalance(token, target2);
      balance3 = await Client.getBalance(token, target3);
      balance4 = await Client.getBalance(token, target4);
      balance5 = await Client.getBalance(token, target5);
      balance6 = await Client.getBalance(token, target6);
      balance7 = await Client.getBalance(token, target7);
      balance8 = await Client.getBalance(token, target8);
      balance9 = await Client.getBalance(token, target9);
      console.log("balance of sender after transfer", balance);
      console.log("balance of recipient1 after transfer", balance0);
      console.log("balance of recipient2 after transfer", balance1);
      console.log("balance of recipient3 after transfer", balance2);
      console.log("balance of recipient4 after transfer", balance3);
      console.log("balance of recipient5 after transfer", balance4);
      console.log("balance of recipient6 after transfer", balance5);
      console.log("balance of recipient7 after transfer", balance6);
      console.log("balance of recipient8 after transfer", balance7);
      console.log("balance of recipient9 after transfer", balance8);
      console.log("balance of recipient10 after transfer", balance9);
    } catch (err) {
      console.log("transfer failed: ", err.message);
    }
  });
  return r;
}

test_mint(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6], process.argv[7], process.argv[8], process.argv[9], process.argv[10], process.argv[11], process.argv[12], process.argv[13], process.argv[14], process.argv[15], process.argv[16], process.argv[17], process.argv[18], process.argv[19], process.argv[20], process.argv[21], process.argv[22]).when("transfer","transactionHash", hash=>console.log(hash)).then(v => {console.log("test done!"); process.exit();});
