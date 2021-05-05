const Web3 = require("web3")
const Config = require("../config")
const Client = require("web3subscriber/client")
const TokenInfo = require("../../build/contracts/Token.json")
const Utils = require("../utils");

async function test_token() {
  console.log("Check address balance:");
  let web3 = await Client.initWeb3(Config, true);
  let accounts = await web3.eth.getAccounts();
  let account = accounts[0];
  console.log(account);
  Utils.info(account);
  let token= Client.getContract(web3, Config, TokenInfo, account);
  let chain_id = await web3.eth.net.getId();
  Utils.info(chain_id);
  try {
    let balance = await Client.getBalance(token, account);
    Utils.info(balance);
  } catch (err) {
    console.log("%s", err);
  }
}

module.exports = {
  test: test_token,
}
