import { withL1Client, L1Client } from "../../client";
import { EthConfig } from "../../config";

const PBinder = require("web3subscriber/src/pbinder");
const Secrets = require("../../.secrets");

function main(configName: string, targetAccount: string) {
  let config = EthConfig[configName](Secrets);
  let account = config.monitor_account;
  let pbinder = new PBinder.PromiseBinder();
  let r = pbinder.return(async () => {
    withL1Client(config, false, async (l1client: L1Client) => {
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
