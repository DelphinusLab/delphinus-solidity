const HDWalletProvider = require('@truffle/hdwallet-provider');
const secrets = require('../.secrets.json');

const contracts = __dirname + "/../build/contracts"; //FIXME: use path.join
console.log(contracts);

const priv2 = "0xf6392ba9b8cb91490a3e06fe141d5140df89e73931b0e3570bad0de7ef1f25c3"

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
    //provider: () => new HDWalletProvider(secrets.priv_key, `https://bsc.getblock.io/testnet/?api_key=182a8e0d-c03a-44ac-b856-41d2e47801db`),
    provider: () => new HDWalletProvider(priv2, `https://bsc.getblock.io/testnet/?api_key=182a8e0d-c03a-44ac-b856-41d2e47801db`),
    mongodb_url: "mongodb://localhost:27017",
    web3_source: "wss://bsc.getblock.io/testnet/?api_key=182a8e0d-c03a-44ac-b856-41d2e47801db",
    //monitor_account: "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b",

    monitor_account: "0x6ea23f9b85ba97890a87b83882696f64ad09f5b6",
    contracts: contracts,
    device_id: "97",
  },
  ropsten: {
    provider: () => new HDWalletProvider(secrets.priv_key, "https://ropsten.infura.io/v3/" + secrets.infura_id),
    mongodb_url: "mongodb://localhost:27017",
    web3_source: "wss://ropsten.infura.io/ws/v3/" + secrets.infura_id,
    monitor_account: "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b",
    contracts: contracts,
    device_id: "3",
  }
}
