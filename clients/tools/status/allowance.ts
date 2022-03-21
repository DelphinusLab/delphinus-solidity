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
      try {
        let balance = await l1client.web3.web3Instance.eth.getBalance(targetAccount);
        console.log(`Balance ${balance}`);
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
