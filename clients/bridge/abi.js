const Web3 = require("web3")
const BigNumber = Web3.utils.BN;
const EthConfig = require('../config');
const BridgeInfo = require("../../build/contracts/Bridge.json");
const Bridge = require("./bridge");

async function getBridge (client_mode) {
  return Bridge.getBridgeClient(EthConfig, BridgeInfo, client_mode);
};

module.exports = {
  getBridge: getBridge,
}
