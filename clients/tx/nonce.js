const Web3 = require("web3")
const FileSys = require("fs")
const Config = require("../config")
const Client = require("web3subscriber/src/client")
const PBinder= require("web3subscriber/src/pbinder")
const TokenInfo = require("../../build/contracts/Token.json")
const Secrets = require('../../.secrets');
const BridgeABI = require("../bridge/abi");

function tx_info(config_name1, config_name2) {
  let pbinder = new PBinder.PromiseBinder();
  let config1 = Config[config_name1](Secrets);
  let config2 = Config[config_name2](Secrets);
  let r = pbinder.return (async () => {
    config1 = Config[config_name1](Secrets);
    config2 = Config[config_name2](Secrets);
    let account = config1.monitor_account;
    let web31 = await Client.initWeb3(config1, false);
    let web32 = await Client.initWeb3(config2, false);
    console.log("version:", web31.version);
    let tx_count2 = await web31.eth.getTransactionCount(account);
    let tx_count_pending2 = await web31.eth.getTransactionCount(account, "pending");
    console.log("Transaction count is ", tx_count2, tx_count_pending2);
    let tx_count3 = await web32.eth.getTransactionCount(account);
    let tx_count_pending3 = await web32.eth.getTransactionCount(account, "pending");
    console.log("Transaction count is ", tx_count3, tx_count_pending3);
    let id = await web32.eth.net.getId();
    console.log(id);

  });
  return r;
}

/* .once("transactionHash",hash => console.log(hash) */
tx_info(process.argv[2], process.argv[3]).then(v => {console.log("test done!"); process.exit();});
