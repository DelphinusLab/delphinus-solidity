import { DelphinusContract, DelphinusWeb3 } from "web3subscriber/src/client";

const GasContractABI = require("../../build/contracts/Gas.json");
// const TokenABI = require("../../build/contracts/IERC20.json");

export class GasContract extends DelphinusContract {
  constructor(web3: DelphinusWeb3, address: string, account?: string) {
    super(web3, GasContract.getJsonInterface(), address, account);
  }

  static getJsonInterface(): any {
    return GasContractABI;
  }

  static getContractAddress(chainId: string) {
    return GasContractABI.networks[chainId].address;
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
