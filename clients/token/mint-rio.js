const Web3 = require("web3")
const FileSys = require("fs")
const Config = require("../config")
const Client = require("web3subscriber/client")
const PBinder= require("web3subscriber/pbinder")
const TokenInfo = require("../../build/contracts/Rio.json")
const Secrets = require('../../.secrets');

function test_mint(config_name, target_account) {
  let pbinder = new PBinder.PromiseBinder();
  let r = pbinder.return (async () => {
    config = Config[config_name](Secrets);
    let account = config.monitor_account;
    let web3 = await Client.initWeb3(config, false);
    let token = Client.getContract(web3, config, TokenInfo, account);
    await web3.eth.net.getId();
    try {
      console.log("mint token:", token.options.address);
      var balance = await token.methods.balanceOf(account).call();
      console.log("sender: balance before mint:", balance);
      await pbinder.bind("mint", token.methods.mint(0x100000000000).send());
      balance = await Client.getBalance(token, account);
      console.log("sender: balance after mint", balance);
      if (target_account) {
        await pbinder.bind("transfer", token.methods.transfer(target_account, 0x100000000000).send());
        balance = await Client.getBalance(token, target_account);
        console.log("balance of recipient after transfer", balance);
      }
    } catch (err) {
      console.log("%s", err);
    }
  });
  return r;
}

/* .once("transactionHash",hash => console.log(hash) */
test_mint(process.argv[2], process.argv[3]).when("mint","transactionHash", hash=>console.log(hash)).then(v => {console.log("test done!"); process.exit();});
