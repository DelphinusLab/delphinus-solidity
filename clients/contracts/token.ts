import { DelphinusContract, DelphinusWeb3 } from "web3subscriber/src/client";
import BN from 'bn.js';

const TokenContractABI = require("../../build/contracts/Token.json");
import { PromiseBinder } from "web3subscriber/src/pbinder";
// const TokenABI = require("../../build/contracts/IERC20.json");

export class TokenContract extends DelphinusContract {
  constructor(web3: DelphinusWeb3, address: string, account?: string) {
    super(web3, TokenContract.getJsonInterface(), address, account);
  }

  static getJsonInterface(): any {
    return TokenContractABI;
  }

  static getContractAddress(chainId: string) {
    return TokenContractABI.networks[chainId].address;
  }

  approve(address: string, amount: BN) {
    return this.getWeb3Contract().methods.approve(address, amount).send();
  }

  async balanceOf(account: string): Promise<BN> {
    let amount = await this.getWeb3Contract().methods.balanceOf(account).call();
    return new BN(amount, 10);
  }

  mint(amount: BN) {
    return this.getWeb3Contract().methods.mint(amount).send();
  }

  transfer(address: string, amount: number) {
    return this.getWeb3Contract()
      .methods.transfer(address, amount)
      .send();
  }
}
