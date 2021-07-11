const Web3 = require("web3")
const FileSys = require("fs")
const Client = require("web3subscriber/client");
const EthConfig = require('../config');
const BridgeABI = require('./abi');
const TokenInfo = require("../../build/contracts/Token.json");
const BN = Web3.utils.BN;

const test_config = {
  l2account: "0x7a50c8fa50a39bd48dfd8053ebff44ba3da45dd8c3e90a5fec9fd73a4595251b",
}

async function test_main(config_name) {
  console.log("pool testing:");
  config = EthConfig[config_name];
  try {
    let bridge = await BridgeABI.getBridge(config, false);
    let buffer = [new BN(2).shln(248),
        new BN("8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48",16),
        new BN(4),
        new BN("00000000000000000000000fe1fbe88925861ddd95d3a3fe67897e367d3bc464",16),
        new BN("000000000000000000000010e1fbe88925861ddd95d3a3fe67897e367d3bc464",16),
        new BN(2),
        new BN(2),
        new BN(38),
        new BN(18)
    ];
    pool_info = await bridge.verify("0x7a50c8fa50a39bd48dfd8053ebff44ba3da45dd8c3e90a5fec9fd73a4595251b", buffer, 0x0,  0x1);
    //pool_info = await bridge.verify("0x7a50c8fa50a39bd48dfd8053ebff44ba3da45dd8c3e90a5fec9fd73a4595251b", [new BN(2)], 0x0,  0x1);
    //pool_info = await bridge.verify("0x7a50c8fa50a39bd48dfd8053ebff44ba3da45dd8c3e90a5fec9fd73a4595251b", [], 0x0,  0x1);
    console.log("pool info", pool_info);
  } catch (err) {
    console.log("%s", err);
  }
}

test_main(process.argv[2]).then(v => console.log("test done!"));
