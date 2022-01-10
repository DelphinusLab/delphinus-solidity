import BN from "bn.js";
import {
  DelphinusWeb3,
  Web3BrowsersMode,
  Web3ProviderMode,
} from "web3subscriber/src/client";
import { encodeL1address } from "web3subscriber/src/addresses";
import { ChainConfig } from "delphinus-deployment/src/types";
import { BridgeContract } from "./contracts/bridge";
import { TokenContract } from "./contracts/token";
import { RioContract } from "./contracts/rio";
import {
  DelphinusHDWalletProvider,
  DelphinusHttpProvider,
  DelphinusWsProvider,
} from "web3subscriber/src/provider";

const L1ADDR_BITS = 160;

function getDelphinusProviderFromConfig(config: ChainConfig) {
  // FIXME: use ethers
  if (config.privateKey === "") {
      return new DelphinusWsProvider(config.wsSource);
  } else {
      return new DelphinusHDWalletProvider(config.privateKey, config.rpcSource);
  }
}

export class L1Client {
  readonly web3: DelphinusWeb3;
  private readonly config: ChainConfig;

  constructor(config: ChainConfig, clientMode: boolean) {
    if (clientMode) {
      this.web3 = new Web3BrowsersMode();
    } else {
      this.web3 = new Web3ProviderMode({
        provider: getDelphinusProviderFromConfig(config),
        monitorAccount: config.monitorAccount,
      });
    }

    this.config = config;
  }

  async init() {
    console.log(`init_bridge on %s`, this.config.chainName);

    await this.web3.connect();
    await this.switchNet();
  }

  async close() {
    await this.web3.close();
  }

  getChainIdHex() {
    return "0x" + new BN(this.config.deviceId).toString(16);
  }

  getDefaultAccount() {
    return this.web3.getDefaultAccount();
  }

  getBridgeContract(account?: string) {
    return new BridgeContract(
      this.web3,
      BridgeContract.getContractAddress(this.config.deviceId),
      account
    );
  }

  getRioContract(address?: string, account?: string) {
    return new RioContract(
      this.web3,
      address || RioContract.getContractAddress(this.config.deviceId),
      account
    );
  }

  getTokenContract(address?: string, account?: string) {
    return new TokenContract(
      this.web3,
      address || TokenContract.getContractAddress(this.config.deviceId),
      account
    );
  }

  private async switchNet() {
    await this.web3.switchNet(
      this.getChainIdHex(),
      this.config.chainName,
      this.config.rpcSource
    );
  }

  /**
   *
   * @param address address must start with 0x
   * @returns
   */
  encodeL1Address(address: string) {
    if (address.substring(0, 2) != "0x") {
      throw "address must start with 0x";
    }

    const addressHex = address.substring(2);
    const chex = this.getChainIdHex().substring(2);
    return encodeL1address(addressHex, chex);
  }
}

export async function withL1Client<t>(
  config: ChainConfig,
  clientMode: boolean,
  cb: (_: L1Client) => Promise<t>
) {
  const l1Client = new L1Client(config, clientMode);
  await l1Client.init();
  try {
    return await cb(l1Client);
  } finally {
    await l1Client.close();
  }
}
