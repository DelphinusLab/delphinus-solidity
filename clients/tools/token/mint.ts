import { withL1Client, L1Client } from "../../client";
import { EthConfigEnabled } from "delphinus-deployment/src/config";
import { PromiseBinder  } from "web3subscriber/src/pbinder";

function main(configName: string, targetAccount: string) {
  let config = EthConfigEnabled.find(config => config.chain_name == configName)!;
  let account = config.monitor_account;
  let pbinder = new PromiseBinder();
  let r = pbinder.return(async () => {
    await withL1Client(config, false, async (l1client: L1Client) => {
      let token = l1client.getTokenContract();
      // await web3.eth.net.getId();
      try {
        console.log("mint token:", token.address());
        let balance = await token.balanceOf(account);
        console.log("sender: balance before mint:", balance);
        await pbinder.bind("mint", token.mint(0x10000000));
        balance = await token.balanceOf(account);
        console.log("sender: balance after mint", balance);
        if (targetAccount) {
          await pbinder.bind(
            "transfer",
            token.transfer(targetAccount, 0x10000000)
          );
          balance = await token.balanceOf(targetAccount);
          console.log("balance of recipient after transfer", balance);
        }
      } catch (err) {
        console.log("%s", err);
      }
    });
  });
  return r;
}

/* .once("transactionHash",hash => console.log(hash) */
main(process.argv[2], process.argv[3]).when(
  "mint",
  "transactionHash",
  (hash: string) => console.log(hash)
);
