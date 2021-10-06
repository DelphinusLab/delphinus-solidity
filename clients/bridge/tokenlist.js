// This is only for test chain
// For main net deployment, we needed to append our targeting coin

const TokenInfo = require("../../build/contracts/Token.json");
const RioInfo = require("../../build/contracts/Rio.json");
const chain_info = {
    "15": "local-test-net1",
    "16": "local-test-net2",
    "3":  "ropsten",
    "97":  "bsctestnet",
}

const token_info = [
  {
    chainId: "15",
    address:TokenInfo.networks["15"].address.replace("0x", ""),
    name:"tToken"
  },
  {
    chainId: "15",
    address:RioInfo.networks["15"].address.replace("0x", ""),
    name:"rio"
  },
  {
    chainId: "16",
    address:TokenInfo.networks["16"].address.replace("0x", ""),
    name:"sToken",
  },
  {
    chainId: "3",
    address:TokenInfo.networks["3"]?.address.replace("0x", ""),
    name:"tToken"
  },
  {
    chainId: "3",
    address:RioInfo.networks["3"]?.address.replace("0x", ""),
    name:"rio",
  },
  {
    chainId: "97",
    address:TokenInfo.networks["97"]?.address.replace("0x", ""),
    name:"sToken"
  },
];

module.exports = {
  chainInfo: chain_info,
  tokenInfo: token_info,
}
