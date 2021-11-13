import { DelphinusContract, DelphinusWeb3 } from "web3subscriber/src/client";

const TokenABI = require("../../build/contracts/IERC20.json");

export class TokenContract extends DelphinusContract {
  constructor(web3: DelphinusWeb3, address: string, account?: string) {
    super(web3, TokenContract.getJsonInterface(), address, account);
  }

  static getJsonInterface(): any {
    return TokenABI;
  }

  async approve(address: string, amount: number) {
    return await this.getWeb3Contract().methods.approve(address, amount).send();
  }

  async balanceOf(account?: string) {
    return account
      ? await this.getWeb3Contract().methods.balanceOf(account).call()
      : await this.getWeb3Contract().methods.balanceOf().call();
  }

  async mint(amount: number) {
    return await this.getWeb3Contract().methods.mint(amount).send();
  }

  async transfer(address: string, amount: number) {
    return await this.getWeb3Contract()
      .methods.transfer(address, amount)
      .send();
  }
}
