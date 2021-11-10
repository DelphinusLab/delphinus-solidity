const Web3 = require("web3")
const FileSys = require("fs")
const Config = require("../config")
const Client = require("web3subscriber/src/client")
const PBinder= require("web3subscriber/src/pbinder")
const TokenInfo = require("../../build/contracts/Token.json")
const Secrets = require('../../.secrets');

function tx_info(config_name, transaction_hash) {
  let pbinder = new PBinder.PromiseBinder();
  let r = pbinder.return (async () => {
    config = Config[config_name](Secrets);
    let account = config.monitor_account;
    let web3 = await Client.initWeb3(config, false);
    let tx = await web3.eth.getTransaction(transaction_hash);
    console.log("balance of recipient after transfer", tx);
  });
  return r;
}

/* .once("transactionHash",hash => console.log(hash) */
tx_info(process.argv[2], process.argv[3]).then(v => {console.log("test done!"); process.exit();});
