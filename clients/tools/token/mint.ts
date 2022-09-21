import BN from 'bn.js';
import { withL1Client, L1Client } from "../../client";
import { getConfigByChainName } from "delphinus-deployment/src/config";
import { PromiseBinder  } from "web3subscriber/src/pbinder";
import { L1ClientRole } from "delphinus-deployment/src/types";

async function main(configName: string, targetAccount: string) {
  let config = await getConfigByChainName(L1ClientRole.Monitor, configName);
  let account = config.monitorAccount;
  let pbinder = new PromiseBinder();
  let r = pbinder.return(async () => {
    await withL1Client(config, false, async (l1client: L1Client) => {
      let token = l1client.getTokenContract();
      // await web3.eth.net.getId();
      try {
        pbinder.snapshot("Mint");
        console.log("mint token:", token.address());
        let balance = await token.balanceOf(account);
        console.log("sender: balance before mint:", balance);
        await pbinder.bind("mint", token.mint(new BN("10000000000000000000")));
        balance = await token.balanceOf(account);
        console.log("sender: balance after mint", balance);
        if (targetAccount) {
          await pbinder.bind(
            "transfer",
            token.transfer(targetAccount, new BN("10000000000000000000"))
          );
          balance = await token.balanceOf(targetAccount);
          console.log("balance of recipient after transfer", balance);
        }
      } catch (err) {
        console.log("%s", err);
      }
    });
  });
  await r.when(
    "mint",
    "transactionHash",
    (hash: string) => console.log(hash)
  );
}

/* .once("transactionHash",hash => console.log(hash) */
main(process.argv[2], process.argv[3]);
