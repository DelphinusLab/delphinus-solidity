import BN from "bn.js";
import {
  DelphinusContract,
  DelphinusProvider,
  DelphinusAccount,
} from "web3subscriber/src/client";
import { decodeL1address } from "web3subscriber/src/addresses";
import { PromiseBinder } from "web3subscriber/src/pbinder";
import { TokenContract } from "./token";
import { Tokens, Chains } from "./tokenlist";
const BridgeContractABI = require("../../build/contracts/Bridge.json");

/*
 * Types
 */
export interface BridgeInfo {
  chain_id: string;
  amount_token: string;
  amount_pool: string;
  owner: string;
  merkle_root: string;
  rid: string;
}

export interface TokenInfo {
  token_uid: string;
}

/*
 * Events
 */
export interface Deposit {
  l1token: string;
  l2account: string;
  amount: string;
  nonce: string;
}

export interface SwapAck {
  l2account: string;
  rid: string;
}

export interface WithDraw {
  l1account: string;
  l2account: string;
  amount: string;
  nonce: string;
}

function hexcmp(x: string, y: string) {
  const xx = new BN(x, "hex");
  const yy = new BN(y, "hex");
  return xx.eq(yy);
}

export class BridgeContract extends DelphinusContract {
  constructor(
    provider: DelphinusProvider,
    address: string,
    account?: DelphinusAccount
  ) {
    super(provider, BridgeContract.getJsonInterface(), address, account);
  }

  static getJsonInterface(): any {
    return BridgeContractABI;
  }

  static getContractAddress(chainId: string) {
    return BridgeContractABI.networks[chainId].address;
  }

  async getBridgeInfo(): Promise<BridgeInfo> {
    return this.methods().getBridgeInfo();
  }

  async allTokens(): Promise<TokenInfo[]> {
    return this.methods().allTokens();
  }

  async addToken(tokenid: BN) {
    return this.methods().addToken(tokenid);
  }

  private async _verify(
    calldata: number[],
    verifydata: BN[],
    vid: number,
    rid: BN
  ) {
    return this.methods().verify(calldata, verifydata, vid, rid);
  }

  private async _deposit(
    tokenAddress: string,
    amount: number,
    l2account: string
  ) {
    return this.methods().deposit(tokenAddress, amount, l2account);
  }

  verify(calldata: number[], verifydata: BN[], vid: number, rid: BN) {
    const pbinder = new PromiseBinder();

    return pbinder.return(async () => {
      return await pbinder.bind(
        "Verify",
        await this._verify(calldata, verifydata, vid, rid)
      );
    });
  }

  deposit(tokenContract: TokenContract, amount: number, l2account: string) {
    const pbinder = new PromiseBinder();

    return pbinder.return(async () => {
      pbinder.snapshot("Approve");
      await pbinder.bind(
        "Approve",
        await tokenContract.approve(this.address(), amount)
      );
      pbinder.snapshot("Deposit");
      return await pbinder.bind(
        "Deposit",
        await this._deposit(tokenContract.address(), amount, l2account)
      );
    });
  }

  private async extractChainInfo() {
    let tokenInfos = await this.allTokens();
    let tokens = tokenInfos
      .filter((t) => t.token_uid != "0")
      .map((token) => {
        let [cid, address] = decodeL1address(token.token_uid);
        return {
          address: address,
          name:
            Tokens.find(
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
      chainName: Chains[chain_id],
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
      chainName: Chains[cid],
      tokenAddress: addr,
      tokenName:
        Tokens.find((x: any) => hexcmp(x.address, addr) && x.chainId == cid)
          ?.name || "unknown",
      index: idx,
    };
  }

  async getMetaData() {
    return {
      bridgeInfo: await this.getBridgeInfo(),
      tokens: await this.allTokens(),
      chainInfo: await this.extractChainInfo(),
    };
  }
}
