const HDWalletProvider = require('@truffle/hdwallet-provider');
const secrets = require('../.secrets.json');

const contracts = __dirname + "/../build/contracts"; //FIXME: use path.join
console.log(contracts);

const priv2 = "0xf6392ba9b8cb91490a3e06fe141d5140df89e73931b0e3570bad0de7ef1f25c3"

const Web3WsProvider = require('web3-providers-ws');
const Web3HttpProvider = require('web3-providers-http');

const options = {
    timeout: 30000, // ms

     clientConfig: {
      // Useful if requests are large
      maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
      maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

      // Useful to keep a connection alive
      keepalive: true,
      keepaliveInterval: 60000 // ms
    },

    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: true
    }
};


const ws_provider = (url, onError) => {
    let p = new Web3WsProvider(url, options);
    //let p = new Web3HttpProvider(url, request_kwargs={'timeout': 60});
    p.on("error", onError.resetter);
    p.on("connect", () => console.log("%s connected", url));
    return p;
}

module.exports = {
  localtestnet1: {
    provider: () => "ws://127.0.0.1:8546",
    mongodb_url: "mongodb://localhost:27017",
    web3_source: "ws://127.0.0.1:8546",
    monitor_account: "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b",
    contracts: contracts,
    device_id: "15",
    chain_name: "localtestnet1",
  },
  localtestnet2: {
    provider: () => "ws://127.0.0.1:8746",
    mongodb_url: "mongodb://localhost:27017",
    web3_source: "ws://127.0.0.1:8746",
    monitor_account: "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b",
    contracts: contracts,
    device_id: "16",
    chain_name: "localtestnet2",
  },
  bsctestnet: {
    provider: (onError) => new HDWalletProvider(priv2, ws_provider("wss://bsc.getblock.io/testnet/?api_key="+secrets.getblock_key, onError)),
    mongodb_url: "mongodb://localhost:27017",
    rpc_source: "https://bsc.getblock.io/testnet/?api_key=" + secrets.getblock_key,
    web3_source: "wss://bsc.getblock.io/testnet/?api_key=" + secrets.get_block_key,
    monitor_account: "0x6ea23f9b85ba97890a87b83882696f64ad09f5b6",
    contracts: contracts,
    device_id: "97",
    chain_name: "bsctestnet",
  },
  ropsten: {
    provider: (onError) => new HDWalletProvider(secrets.priv_key, ws_provider(
      "wss://ropsten.infura.io/ws/v3/" + secrets.infura_id, onError)),
    mongodb_url: "mongodb://localhost:27017",
    rpc_source: "https://ropsten.infura.io/v3/" + secrets.infura_id,
    web3_source: "wss://ropsten.infura.io/ws/v3/" + secrets.infura_id,
    monitor_account: "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b",
    contracts: contracts,
    device_id: "3",
    chain_name: "ropsten",
  }
}
