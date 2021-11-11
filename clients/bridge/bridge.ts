import BN from "bn.js";
import {
  DelphinusContract,
  DelphinusWeb3,
  Web3BrowsersMode,
  Web3ProviderMode,
} from "web3subscriber/src/client";
import { PromiseBinder } from "web3subscriber/src/pbinder";
import { ChainConfig } from "../config";
import { BridgeInfo, TokenInfo } from "../types/bridge";

const ERC20 = require("../../build/contracts/IERC20.json");
const VERIFIER = require("../../build/contracts/Verifier.json");
const BridgeContract = require("../../build/contracts/Bridge.json");

const L1ADDR_BITS = 160;
const Tokens = require("./tokenlist");

function hexcmp(x: string, y: string) {
  const xx = new BN(x, "hex");
  const yy = new BN(y, "hex");
  return xx.eq(yy);
}

export function encodeL1address(address_hexstr: string, chex: string) {
  let c = new BN(chex + "0000000000000000000000000000000000000000", "hex");
  let a = new BN(address_hexstr, 16);
  return c.add(a);
}

/* chain_id:dec * address:hex
 */
function decodeL1address(l1address: string) {
  let uid = new BN(l1address);
  let chain_id = uid.shrn(L1ADDR_BITS);
  let address_hex = uid.sub(chain_id.shln(L1ADDR_BITS)).toString(16);
  //address is 160 thus we need to padding '0' at the begining
  let prefix = Array(40 - address_hex.length + 1).join("0");
  address_hex = prefix + address_hex;
  let chain_hex = chain_id.toString(10);
  return [chain_hex, address_hex];
}

export class Bridge {
  readonly web3: DelphinusWeb3;
  private readonly config: ChainConfig;
  private readonly bridgeInfo: any;
  private bridgeContract?: DelphinusContract;

  constructor(config: ChainConfig, clientMode: boolean) {
    if (clientMode) {
      this.web3 = new Web3BrowsersMode();
    } else {
      this.web3 = new Web3ProviderMode({
        provider: config.provider(),
        closeProvider: config.close_provider,
        monitorAccount: config.monitor_account,
      });
    }

    this.config = config;
    this.bridgeInfo = BridgeContract;
  }

  getChainIdHex() {
    return "0x" + new BN(this.config.device_id).toString(16);
  }

  async init() {
    const bridgeAddress =
      this.bridgeInfo.networks[this.config.device_id].address;

    console.log(`init_bridge on %s`, this.config.chain_name);

    await this.web3.connect();
    await this.switchNet();

    this.bridgeContract = await this.web3.getContract(
      this.bridgeInfo,
      bridgeAddress,
      this.web3.getDefaultAccount()
    );
  }

  private async switchNet() {
    await this.web3.switchNet(
      this.getChainIdHex(),
      this.config.chain_name,
      this.config.rpc_source
    );
  }

  private async extractChainInfo() {
    let tokenInfos = await this.allTokens();
    let tokens = tokenInfos.filter(
      (t) => t.token_uid != "0"
    ).map((token) => {
      let [cid, address] = decodeL1address(token.token_uid);
      return {
        address: address,
        name:
          Tokens.tokenInfo.find(
            (x: any) => hexcmp(x.address, address) && x.chainId == cid
          )?.name || "unknown",
        chainId: cid,
        index: tokenInfos.findIndex(
          (x: TokenInfo) => x.token_uid == token.token_uid
        ),
      };
    });
    let chain_list = Array.from(new Set(tokens.map((x) => x.chainId)));
    let token_list = chain_list.map((chain_id) => ({
      chainId: chain_id,
      chainName: Tokens.chainInfo[chain_id],
      tokens: tokens.filter((x) => x.chainId == chain_id),
      enable: true,
    }));
    return token_list;
  }

  async getTokenInfo(idx: number) {
    const token = (await this.allTokens())[idx];
    let [cid, addr] = decodeL1address(token.token_uid);
    return {
      chainId: cid,
      chainName: Tokens.chainInfo[cid],
      tokenAddress: addr,
      tokenName:
        Tokens.tokenInfo.find(
          (x: any) => hexcmp(x.address, addr) && x.chainId == cid
        )?.name || "unknown",
      index: idx,
    };
  }

  /**
   *
   * @param address address must start with 0x
   * @returns
   */
  encodeL1address(address: string) {
    if (address.substring(0, 2) != "0x") {
      throw "address must start with 0x";
    }

    const addressHex = address.substring(2);
    const chex = this.getChainIdHex().substring(2);
    return encodeL1address(addressHex, chex);
  }

  async getMetaData() {
    return {
      bridgeInfo: await this.getBridgeInfo(),
      tokens: await this.allTokens(),
      chainInfo: await this.extractChainInfo(),
    };
  }

  private async getBridgeContract() {
    if (this.bridgeContract === undefined) {
      throw "Bridge not initialized.";
    }

    await this.switchNet();
    return this.bridgeContract;
  }

  async getBridgeInfo(): Promise<BridgeInfo> {
    const contract = await this.getBridgeContract();

    return await contract.getContractInstance().methods.getBridgeInfo().call();
  }

  async allTokens(): Promise<TokenInfo[]> {
    const contract = await this.getBridgeContract();

    return await contract.getContractInstance().methods.allTokens().call();
  }

  async addToken(tokenid: BN) {
    const contract = await this.getBridgeContract();

    return await contract
      .getContractInstance()
      .methods.addToken(tokenid)
      .send();
  }

  verify(
    l2account: string,
    calldata: BN[],
    verifydata: BN[],
    vid: number,
    nonce: number,
    rid: BN
  ) {
    const pbinder = new PromiseBinder();

    return pbinder.return(async () => {
      const contract = await this.getBridgeContract();

      return await pbinder.bind(
        "Verify",
        contract
          .getContractInstance()
          .methods.verify(l2account, calldata, verifydata, vid, nonce, rid)
          .send()
      );
    });
  }

  deposit(tokenAddress: string, amount: number, l2account: string) {
    const pbinder = new PromiseBinder();

    return pbinder.return(async () => {
      const contract = await this.getBridgeContract();

      const token = this.web3.getContract(
        ERC20,
        tokenAddress,
        this.web3.getDefaultAccount()
      );

      pbinder.snapshot("Approve");
      await pbinder.bind(
        "Approve",
        token
          .getContractInstance()
          .methods.approve(
            contract.getContractInstance().options.address,
            amount
          )
          .send()
      );
      pbinder.snapshot("Deposit");
      return await pbinder.bind(
        "Deposit",
        contract
          .getContractInstance()
          .methods.deposit(tokenAddress, amount, l2account)
          .send()
      );
    });
  }

  async close() {
    await this.web3.close();
  }
}

export async function withBridgeClient<t>(
  config: ChainConfig,
  clientMode: boolean,
  cb: (_: Bridge) => Promise<t>
) {
  const bridge = new Bridge(config, clientMode);
  await bridge.init();
  try {
    return await cb(bridge);
  } finally {
    bridge.close();
  }
}
