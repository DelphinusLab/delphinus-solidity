// This is only for test chain
// For main net deployment, we needed to append our targeting coin

const TokenInfo = require("../../build/contracts/Token.json");
const GasInfo = require("../../build/contracts/Gas.json");

export const Chains : Record<string, string> = {
    "15": "local-test-net1",
    "16": "local-test-net2",
    "3":  "ropsten",
    "97":  "bsctestnet",
}

export const Tokens = [
  {
    chainId: "15",
    address:TokenInfo.networks["15"]?.address.replace("0x", ""),
    wei:12,
    name:"tToken"
  },
  {
    chainId: "15",
    address:GasInfo.networks["15"]?.address.replace("0x", ""),
    wei:12,
    name:"rio"
  },
  {
    chainId: "16",
    address:TokenInfo.networks["16"]?.address.replace("0x", ""),
    wei:12,
    name:"sToken",
  },
  {
    chainId: "3",
    address:TokenInfo.networks["3"]?.address.replace("0x", ""),
    wei:12,
    name:"tToken"
  },
  {
    chainId: "3",
    address:GasInfo.networks["3"]?.address.replace("0x", ""),
    wei:12,
    name:"rio",
  },
  {
    chainId: "97",
    address:TokenInfo.networks["97"]?.address.replace("0x", ""),
    wei:12,
    name:"tToken"
  },
];
