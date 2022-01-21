import BN from "bn.js";
import {
  DelphinusBrowserProvider,
  DelphinusProvider,
  DelphinusRpcProvider,
} from "web3subscriber/src/client";
import { encodeL1address } from "web3subscriber/src/addresses";
import { ChainConfig } from "delphinus-deployment/src/types";
import { BridgeContract } from "./contracts/bridge";
import { TokenContract } from "./contracts/token";
import { RioContract } from "./contracts/rio";
const L1ADDR_BITS = 160;

export class L1Client {
  readonly provider: DelphinusProvider;
  private readonly config: ChainConfig;

  constructor(config: ChainConfig, clientMode: boolean) {
    if (clientMode) {
      this.provider = new DelphinusBrowserProvider();
    } else {
      this.provider = new DelphinusRpcProvider({
        chainRpc: config.rpcSource,
        monitorAccount: config.monitorAccount,
      });
    }

    this.config = config;
  }

  async init() {
    console.log(`init_bridge on %s`, this.config.chainName);

    await this.provider.connect();
    await this.switchNet();
  }

  async close() {
    await this.provider.close();
  }

  getChainIdHex() {
    return "0x" + new BN(this.config.deviceId).toString(16);
  }

  getDefaultAccount() {
    return this.provider.getDefaultSigner().getAddress();
  }

  getBridgeContract(account?: string) {
    return new BridgeContract(
      this.provider,
      BridgeContract.getContractAddress(this.config.deviceId),
      this.provider.getSigner(account)
    );
  }

  getRioContract(address?: string, account?: string) {
    return new RioContract(
      this.provider,
      address || RioContract.getContractAddress(this.config.deviceId),
      this.provider.getSigner(account)
    );
  }

  getTokenContract(address?: string, account?: string) {
    return new TokenContract(
      this.provider,
      address || TokenContract.getContractAddress(this.config.deviceId),
      this.provider.getSigner(account)
    );
  }

  private async switchNet() {
    await this.provider.switchNet(
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
