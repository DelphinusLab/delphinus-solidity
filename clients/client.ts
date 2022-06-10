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
import { GasContract } from "./contracts/gas";
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


const GasTokenInfo = require("../build/contracts/Gas.json");

export function getChargeAddress(deviceId: string) {
  let chargeAddress = GasTokenInfo.networks[deviceId].address;
  let deviceIdHex = parseInt(deviceId).toString(16);
  let encodedChargeAddress =
    "0x" +
    encodeL1address(chargeAddress.substring(2), deviceIdHex).toString(
      16
    );
  return encodedChargeAddress;
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

  async isConnected(): Promise<boolean> {
    const retryTime: number = 10;
    const delay: number = 300; 
    console.log("In withL1Client isConnected");

    if(this.isDelphinusHDWalletProvider(this)) {
      console.log("In withL1Client is hdWalletProvider");
      

      for (let i = 0; i <retryTime; i++) {
        console.log("for loop: ", i);
        const web3Provider = this.web3 as Web3ProviderMode;
        const hdWalletProvider = web3Provider.delphinusProvider as DelphinusHDWalletProvider;
        
        if(hdWalletProvider.errHDWalletProvider != null) {
          console.log("return error", i);
          throw hdWalletProvider.errHDWalletProvider;
        }
        else if(hdWalletProvider.connected == true) {
          console.log("return connected", i);
          return true;
        }
        else {
          console.log("waiting ", i);
          await new Promise((resolve) => setTimeout(resolve, 300)); // 0.3 second delay
        }
      }
      return false;
    }
    else {
      console.log("In withL1Client is NOT hdWalletProvider");
      return true;
    }
  }

  private isDelphinusHDWalletProvider(obj: any): obj is DelphinusHDWalletProvider {
    console.log("In isDelphinusHDWalletProvider function");
    return obj?.web3?.delphinusProvider?.errHDWalletProvider !== undefined 
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

  getGasContract(address?: string, account?: string) {
    return new GasContract(
      this.web3,
      address || GasContract.getContractAddress(this.config.deviceId),
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
  console.log("In withL1Client random:", Math.random() * 100000);
  const l1Client = new L1Client(config, clientMode);
  await l1Client.isConnected();
  console.log("In withL1Client random 2:", Math.random() * 100000);
  await l1Client.init();
  try {
    return await cb(l1Client);
  }
  finally {
    await l1Client.close();
  }
}
