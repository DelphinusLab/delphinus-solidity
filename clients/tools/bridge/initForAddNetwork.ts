import { getConfigByChainName } from "delphinus-deployment/src/config";
import { L1Client, withL1Client } from "../../client";
import { encodeL1address } from "web3subscriber/src/addresses";
import { extraTokens, contractsInfo} from "delphinus-deployment/config/contractsinfo";
import { L1ClientRole } from "delphinus-deployment/src/types";
import BN from "bn.js";
import { TokenInfo } from "../../contracts/bridge";

const fs = require("fs");
const path = require("path");

function crunchTokens() {
  return contractsInfo.tokens.concat(extraTokens)
    .filter((x: any) => x.address)
    .map((x: any) =>
    encodeL1address(x.address, parseInt(x.chainId).toString(16))
    );
}

// get initTokens to make sure sequence of token list is consistent 
// with token list in bridge on pre-existing network
async function getInitTokens(configName: string) {
  let config = await getConfigByChainName(L1ClientRole.Monitor, configName);
  let initTokens: BN[] = new Array();
  try {
    await withL1Client(config, false, async (l1client: L1Client) => {
      let bridge = l1client.getBridgeContract();
      let existingTokens = await bridge.allTokens();
      let tokenUids = new Array();
      for (let i = 0; i < existingTokens.length; i++) {
        tokenUids.push(existingTokens[i].token_uid);
      }
      let newAddedTokens = crunchTokens().filter((tokenUid: string) => {
        return !tokenUids.includes(tokenUid.toString());
      });
      if (newAddedTokens.length == 0) {
        console.log("No new-added tokens");
       	process.exit();
      }
      initTokens = tokenUids.concat(newAddedTokens.toString()).map((x: any) => new BN(x));
    });
    return initTokens;
  } catch (err) {
    console.log("%s", err);
  }
}

// add tokens to new-added network and pre-existing network
async function main(configNames: string[]) {
  // element at index 1 is pre-existing network
  let initTokens: BN[] | undefined;
  if (configNames[1]) {
    initTokens = await getInitTokens(configNames[1]);
  } else {
    console.log("Error: There are no pre-existing network.");
    process.exit();
  }
  try {
    let output: any = {};
    for (let i = 0; i < configNames.length; i++) {
      console.log("start calling");
      let config = await getConfigByChainName(L1ClientRole.Monitor, configNames[i]);
      await withL1Client(config, false, async (l1client: L1Client) => {
        let bridge = l1client.getBridgeContract();
        let existingTokens = await bridge.allTokens();
        let index = 0;
        console.log("Init tokens in bridge [id=%s]", l1client.getChainIdHex());
        console.log("Existing tokens:");
	if(initTokens != undefined) {
        for (let tokenUid of initTokens) {
          if (index < existingTokens.length) {
            if (existingTokens[index].token_uid !== tokenUid.toString()) {
              console.log("Token does not match " + existingTokens[index].token_uid + " " + tokenUid.toString());
	      process.exit();
            }
	  } else {
            console.log(`Adding token uid: ${tokenUid.toString(16)}`);
            let tx = await bridge.addToken(tokenUid);
            console.log(tx);
          }
	  if (i == 0) {
            output[tokenUid.toString()] = index++;
	  } else {
	    index++;
	  }
        }
        }
        if (i == 0) {
          fs.writeFileSync(
            path.resolve(__dirname, "../../../../deployment/config", "token-index.json"),
            JSON.stringify(output, undefined, 2)
          );
	}

        let info = await bridge.getBridgeInfo();
        console.log("bridge info is", info);
        let tokens = await bridge.allTokens();
        console.log("token list is", tokens);
      });
    }
  } catch (err) {
    console.log("%s", err);
  }
}

// parameter is [newConfigName, oldConfigName1, oldConfigNames2,...]
main(["cantotestnet", "bsctestnet"]);
