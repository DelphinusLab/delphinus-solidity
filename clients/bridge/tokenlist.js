// This is only for test chain
// For main net deployment, we needed to append our targeting coin

const TokenInfo = require("../../build/contracts/Token.json");
const RioInfo = require("../../build/contracts/Rio.json");
const _token_list = [
  {
    chainId: "15",
    chainName: "local-test-net1",
    enable:true,
    tokens: [
      {
        address:TokenInfo.networks["15"].address.replace("0x", ""),
        name:"tToken"
      },
      {
        address:RioInfo.networks["15"].address.replace("0x", ""),
        name:"rio"
      }
    ],
  },
  {
    chainId: "16",
    chainName: "local-test-net2",
    enable:true,
    tokens: [
      {
        address:TokenInfo.networks["16"].address.replace("0x", ""),
        name:"sToken"
      }
    ],
  },
  {
    chainId: "3",
    chainName: "ropsten",
    enable:false,
    tokens: [
      {
        address:TokenInfo.networks["3"].address.replace("0x", ""),
        name:"tToken"
      },
      {
        address:RioInfo.networks["3"].address.replace("0x", ""),
        name:"rio"
      }
    ],
  },
  {
    chainId: "97",
    chainName: "bsctestnet",
    enable:false,
    tokens: [
      {
        address:TokenInfo.networks["97"].address.replace("0x", ""),
        name:"sToken"
      }
    ],
  },
];

module.exports = {
  chainList: _token_list,
}
