const HDWalletProvider = require('@truffle/hdwallet-provider');

const Web3WsProvider = require('web3-providers-ws');
const Web3HttpProvider = require('web3-providers-http');

const ws_options = {
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

const http_options = {
        keepAlive: true,
        timeout: 20000, // milliseconds,
        withCredentials: false
};


const ws_provider = (url) => {
    let p = new Web3WsProvider(url, ws_options);
    return p;
}

const http_provider = (url) => {
    let p = new Web3HttpProvider(url, http_options);
    return p;
}

module.exports = {
  localtestnet1: () => {return {
    provider: () => "ws://127.0.0.1:8546",
    mongodb_url: "mongodb://localhost:27017",
    ws_source: "ws://127.0.0.1:8546",
    rpc_source: "ws://127.0.0.1:8545",
    device_id: "15",
    monitor_account: "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b",
    chain_name: "localtestnet1",
  }},
  localtestnet2: () => {return {
    provider: () => "ws://127.0.0.1:8746",
    mongodb_url: "mongodb://localhost:27017",
    rpc_source: "http://127.0.0.1:8745",
    ws_source: "ws://127.0.0.1:8746",
    monitor_account: "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b",
    device_id: "16",
    chain_name: "localtestnet2",
  }},
  bsctestnet: (secrets) => {return {
    provider: () => new HDWalletProvider(secrets.accounts.deployer.priv,
      http_provider("https://bsc.getblock.io/testnet/?api_key="+secrets.getblock_key)
    ),
    mongodb_url: "mongodb://localhost:27017",
    rpc_source: "https://bsc.getblock.io/testnet/?api_key=" + secrets.getblock_key,
    ws_source: "wss://bsc.getblock.io/testnet/?api_key=" + secrets.getblock_key,
    monitor_account: "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b",
    device_id: "97",
    chain_name: "bsctestnet",
  }},
  ropsten: (secrets) => {return {
    provider: () => new HDWalletProvider(secrets.accounts.deployer.priv,
      http_provider("https://ropsten.infura.io/v3/" + secrets.infura_id)
    ),
    mongodb_url: "mongodb://localhost:27017",
    rpc_source: "https://ropsten.infura.io/v3/" + secrets.infura_id,
    ws_source: "wss://ropsten.infura.io/ws/v3/" + secrets.infura_id,
    monitor_account: "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b",
    device_id: "3",
    chain_name: "ropsten",
  }}
}
