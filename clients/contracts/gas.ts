import { DelphinusContract, DelphinusWeb3 } from "web3subscriber/src/client";
import { contractsInfo } from "delphinus-deployment/config/contractsinfo";
import BN from "bn.js";

export class GasContract extends DelphinusContract {
  constructor(web3: DelphinusWeb3, address: string, account?: string) {
    super(web3, GasContract.getJsonInterface(), address, account);
  }

  static getJsonInterface(): any {
    return contractsInfo.interfaceMap.gas;
  }

  static getContractAddress(chainId: string) {
    return contractsInfo.addressMap.gasToken[chainId].address;
  }

  approve(address: string, amount: BN) {
    return this.getWeb3Contract().methods.approve(address, amount).send();
  }

  balanceOf(account: string) {
    return this.getWeb3Contract().methods.balanceOf(account).call();
  }

  mint(amount: BN) {
    return this.getWeb3Contract().methods.mint(amount).send();
  }

  transfer(address: string, amount: BN) {
    return this.getWeb3Contract().methods.transfer(address, amount).send();
  }
}
