import { DelphinusContract, DelphinusWeb3 } from "web3subscriber/src/client";

const RioContractABI = require("../../build/contracts/Rio.json");
// const TokenABI = require("../../build/contracts/IERC20.json");

export class RioContract extends DelphinusContract {
  constructor(web3: DelphinusWeb3, address: string, account?: string) {
    super(web3, RioContract.getJsonInterface(), address, account);
  }

  static getJsonInterface(): any {
    return RioContractABI;
  }

  static getContractAddress(chainId: string) {
    return RioContractABI.networks[chainId].address;
  }

  approve(address: string, amount: number) {
    return this.getWeb3Contract().methods.approve(address, amount).send();
  }

  balanceOf(account: string) {
    return this.getWeb3Contract().methods.balanceOf(account).call();
  }

  mint(amount: number) {
    return this.getWeb3Contract().methods.mint(amount).send();
  }

  transfer(address: string, amount: number) {
    return this.getWeb3Contract()
      .methods.transfer(address, amount)
      .send();
  }
}
