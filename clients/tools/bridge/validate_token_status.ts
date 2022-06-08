//Run command example: node validate_token_status.ts ropsten
//It will check that the tokens' addresses listed in deployment/config/token-index.json match the token addresses in Bridge Contract

import { getConfigByChainName } from "delphinus-deployment/src/config";
import { L1Client, withL1Client } from "../../client";
import { encodeL1address } from "web3subscriber/src/addresses";
import { Tokens } from "../../contracts/tokenlist";
import { L1ClientRole } from "delphinus-deployment/src/types";
import fs from "fs-extra";

const tokenList = fs.readJsonSync("../../../node_modules/delphinus-deployment/config/token-index.json");

interface ITokenList {
  [token_uid: string]: number
}

async function main(config_name: string) {
  console.log("Begin validation:");
  let config = await getConfigByChainName(L1ClientRole.Monitor, config_name);
  try {
    await withL1Client(config, false, async (l1client: L1Client) => {
      let bridge = l1client.getBridgeContract();
      console.log("Grabbing meta for bridge [id=%s] %s", l1client.getChainIdHex(), config_name);
      let metadata = await bridge.getMetaData();
      //console.log("metadata:", metadata);

      let bridgeTokenList: ITokenList = {}
      let count = 0;
      metadata.tokens.forEach((token) => {
        //Check token_uid existing in the deployment token-index.json and all match
        bridgeTokenList[token.token_uid] = count++;
      });

      if (JSON.stringify(tokenList) == JSON.stringify(bridgeTokenList))
        console.log("Validation Success!");
      else
      {
        console.log("Validation Failed.");
        console.log("Token uid on Bridge:");
        console.log(bridgeTokenList);
        console.log("Token uid in deployment:");
        console.log(tokenList);
      }
    });
  } catch (err) {
    console.log("%s", err);
  }
}

main(process.argv[2]).then(v => { process.exit(); })
