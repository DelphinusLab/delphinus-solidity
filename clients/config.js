const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const infura_id = fs.readFileSync("../../.secret.infura").toString().trim();
const priv_key = fs.readFileSync("../../tools/key.prv").toString().trim();
const contracts = __dirname + "/../build/contracts"; //FIXME: use path.join

module.exports = {
  localtestnet1: {
    provider: () => "ws://127.0.0.1:8546",
    mongodb_url: "mongodb://localhost:27017",
    web3_source: "ws://127.0.0.1:8546",
    monitor_account: "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b",
    contracts: contracts,
    device_id: "15",
  },
  localtestnet2: {
    provider: () => "ws://127.0.0.1:8746",
    mongodb_url: "mongodb://localhost:27017",
    web3_source: "ws://127.0.0.1:8746",
    monitor_account: "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b",
    contracts: contracts,
    device_id: "16",
  },
  bsctestnet: {
    mongodb_url: "mongodb://localhost:27017",
    web3_source: "wss://data-seed-prebsc-1-s1.binance.org:8546",
    monitor_account: "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b",
    contracts: contracts,
    device_id: "97",
  },
  ropsten: {
    provider: () => new HDWalletProvider(priv_key, "wss://ropsten.infura.io/ws/v3/" + infura_id),
    mongodb_url: "mongodb://localhost:27017",
    web3_source: "wss://ropsten.infura.io/ws/v3/" + infura_id,
    monitor_account: "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b",
    contracts: contracts,
    device_id: "3",
  }
}
