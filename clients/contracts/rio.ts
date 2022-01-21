import {
  DelphinusContract,
  DelphinusProvider,
  DelphinusAccount,
} from "web3subscriber/src/client";

const RioContractABI = require("../../build/contracts/Rio.json");
// const TokenABI = require("../../build/contracts/IERC20.json");

export class RioContract extends DelphinusContract {
  constructor(
    provider: DelphinusProvider,
    address: string,
    account?: DelphinusAccount
  ) {
    super(provider, RioContract.getJsonInterface(), address, account);
  }

  static getJsonInterface(): any {
    return RioContractABI;
  }

  static getContractAddress(chainId: string) {
    return RioContractABI.networks[chainId].address;
  }

  approve(address: string, amount: number) {
    return this.methods().approve(address, amount);
  }

  balanceOf(account: string) {
    return this.methods().balanceOf(account);
  }

  mint(amount: number) {
    return this.methods().mint(amount);
  }

  transfer(address: string, amount: number) {
    return this.methods().transfer(address, amount);
  }
}
