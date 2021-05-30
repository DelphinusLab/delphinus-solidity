const PrivateKeyProvider = require('web3-privatekey-provider');
const fs = require('fs');
const infura_id = fs.readFileSync(__dirname + "/../.secret.infura").toString().trim();
let priv_key = "0x" + fs.readFileSync(__dirname + "/../tools/key.prv").toString().trim();

const contracts = __dirname + "/../build/contracts"; //FIXME: use path.join
console.log(contracts);

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
    provider: () => new PrivateKeyProvider(priv_key, `https://bsc.getblock.io/testnet/?api_key=182a8e0d-c03a-44ac-b856-41d2e47801db`),
    mongodb_url: "mongodb://localhost:27017",
    web3_source: "wss://bsc.getblock.io/testnet/?api_key=182a8e0d-c03a-44ac-b856-41d2e47801db",
    monitor_account: "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b",
    contracts: contracts,
    device_id: "97",
  },
  ropsten: {
    provider: () => new PrivateKeyProvider(priv_key, "https://ropsten.infura.io/v3/" + infura_id),
    mongodb_url: "mongodb://localhost:27017",
    web3_source: "wss://ropsten.infura.io/ws/v3/" + infura_id,
    monitor_account: "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b",
    contracts: contracts,
    device_id: "3",
  }
}
