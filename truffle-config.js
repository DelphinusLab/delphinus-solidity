/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const Web3WsProvider = require('web3-providers-ws');
const Web3HttpProvider = require('web3-providers-http');

const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const secrets = require('delphinus-deployment/config/monitor-secrets.json');

const http_options = {
        keepAlive: true,
        timeout: 20000, // milliseconds,
        headers: [{name: 'Access-Control-Allow-Origin', value: '*'}],
        withCredentials: false
};

const http_provider = (url) => {
    let p = new Web3HttpProvider(url, http_options);
    return p;
}

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
      from: "0xea9225F0013D64d12e75B89c19da9e3922C86556",
      gas: 3100000,           // Gas sent with each transaction (default: ~6700000)
      websocket: true        // Enable EventEmitter interface for web3 (default: false)
    },
    testnet1: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
      from: "0xea9225F0013D64d12e75B89c19da9e3922C86556",
      gas: 3100000,           // Gas sent with each transaction (default: ~6700000)
      websocket: true        // Enable EventEmitter interface for web3 (default: false)
    },
    testnet2: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8745,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
      from: "0xea9225F0013D64d12e75B89c19da9e3922C86556",
      gas: 3100000,           // Gas sent with each transaction (default: ~6700000)
      websocket: true        // Enable EventEmitter interface for web3 (default: false)
    },
    goerli: { //eth testnet
      provider: () => new HDWalletProvider(secrets.accounts.deployer.priv,
        http_provider("https://eth.getblock.io/goerli/?api_key=" + secrets.getblock_key_goerli)
      ),
      network_id: 5,       // goerli's id
      gas: 5500000,        // goerli has a lower block limit than mainnet
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 400,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    bsctestnet: { //bsc
      provider: () => new HDWalletProvider(secrets.accounts.deployer.priv,
        http_provider(`https://data-seed-prebsc-1-s1.binance.org:8545`)
        //http_provider("https://bsc.getblock.io/testnet/?api_key="+secrets.getblock_key)
      ),
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    cronostestnet: {
      provider: () => new HDWalletProvider(secrets.accounts.deployer.priv,
        "wss://cronos-testnet-3.crypto.org:8546"),
      network_id: 338,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    rolluxtestnet: {
      provider: () => new HDWalletProvider(secrets.accounts.deployer.priv,
        http_provider("https://testnet.rollux.com:2814/")),
      network_id: 2814,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "native",    // Fetch exact version from solc-bin (default: truffle's version)
    }
  },

  // Note: if you migrated your contracts prior to enabling this field in your Truffle project and want
  // those previously migrated contracts available in the .db directory, you will need to run the following:
  // $ truffle migrate --reset --compile-all

  db: {
    enabled: false
  }
};
