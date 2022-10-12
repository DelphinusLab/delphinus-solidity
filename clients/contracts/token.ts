import BN from 'bn.js';
import { DelphinusContract, DelphinusWeb3 } from "web3subscriber/src/client";
import { PromiseBinder } from "web3subscriber/src/pbinder";
import { contractsInfo } from "delphinus-deployment/config/contractsinfo";

export class TokenContract extends DelphinusContract {
  constructor(web3: DelphinusWeb3, address: string, account?: string) {
    super(web3, TokenContract.getJsonInterface(), address, account);
  }

  static getJsonInterface(): any {
    return contractsInfo.interfaceMap.gas;
  }

  static getContractAddress(chainId: string) {
    return contractsInfo.addressMap.testToken[chainId].address;
  }

  approve(address: string, amount: BN) {
    return this.getWeb3Contract().methods.approve(address, amount).send();
  }

  async balanceOf(account: string): Promise<BN> {
    let amount = await this.getWeb3Contract().methods.balanceOf(account).call();
    return new BN(amount, 10);
  }

  async allowanceOf(account: string, spender: string ): Promise<BN> {
    let amount = await this.getWeb3Contract().methods.allowance(account, spender).call();
    return new BN(amount, 10);
  }


  mint(amount: BN) {
    return this.getWeb3Contract().methods.mint(amount).send();
  }

  transfer(address: string, amount: BN) {
    return this.getWeb3Contract()
      .methods.transfer(address, amount)
      .send();
  }
}
