import { Bridge, withBridgeClient } from "../bridge/bridge";
import { EthConfig } from "../config";

const Config = require("../config");
const PBinder = require("web3subscriber/src/pbinder");
const TokenInfo = require("../../build/contracts/Token.json");
const Secrets = require("../../.secrets");

function main(configName: string, targetAccount: string) {
  let config = EthConfig[configName](Secrets);
  let account = config.monitor_account;
  let address = TokenInfo.networks[config.device_id].address;
  let pbinder = new PBinder.PromiseBinder();
  let r = pbinder.return(async () => {
    withBridgeClient(config, false, async (bridge: Bridge) => {
      let token = bridge.web3.getContract(TokenInfo, address, account);
      // await web3.eth.net.getId();
      try {
        console.log("mint token:", token.getContractInstance().options.address);
        let balance = await token.getBalance(account);
        console.log("sender: balance before mint:", balance);
        await pbinder.bind("mint", token.getContractInstance().methods.mint(0x10000000).send());
        balance = await token.getBalance(account);
        console.log("sender: balance after mint", balance);
        if (targetAccount) {
          await pbinder.bind(
            "transfer",
            token.getContractInstance().methods.transfer(targetAccount, 0x10000000).send()
          );
          balance = await token.getBalance(targetAccount);
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
