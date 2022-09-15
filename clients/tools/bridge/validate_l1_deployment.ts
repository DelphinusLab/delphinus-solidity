import { contractsInfo } from "../../config-contracts-info";
import { extraTokens } from "delphinus-deployment/config/contractsinfo";
import { getEthConfigs, getConfigByChainName } from "delphinus-deployment/src/config";
import { L1Client, withL1Client } from "../../client";
import { L1ClientRole } from "delphinus-deployment/src/types";
import { encodeL1address } from "web3subscriber/src/addresses";

const bridgeContract = require("../../../build/contracts/Bridge.json");
const tokenList = require("../../../node_modules/delphinus-deployment/config/token-index.json");

interface ITokenList {
  [token_uid: string]: number
}

function crunchTokens() {
  return contractsInfo.tokens.concat(extraTokens)
    .filter((x: any) => x.address)
    .map((x: any) =>
    encodeL1address(x.address, parseInt(x.chainId).toString(16))
    );
}

async function checkL1Deployment(chainName: string, chainId: string) {
  // Check migrate
  if(chainId in bridgeContract.networks) {
    console.log("Truffle migrate to", chainName, "succeed!");
  } else {
    console.log("Truffle migrate to", chainName, "failed or was not executed!");
    process.exit();
  }

  // Check init.js
  let ethConfig = await getConfigByChainName(L1ClientRole.Monitor, chainName);
  try {
    await withL1Client(ethConfig, false, async (l1client: L1Client) => {
      let bridge = l1client.getBridgeContract();
      console.log("Grabbing meta for bridge [id=%s] %s", l1client.getChainIdHex(), chainName);
      let metadata = await bridge.getMetaData();
      let bridgeTokenList: ITokenList = {}
      let count = 0;
      metadata.tokens.forEach((token) => {
        //Check token_uid existing in the deployment token-index.json and all match
        bridgeTokenList[token.token_uid] = count++;
      });

      if(JSON.stringify(tokenList) == JSON.stringify(bridgeTokenList)) {
        console.log("Add token to bridge on", chainName, "succeed!");
      } else {
        console.log("Error: Token uid on bridge and token uid in deployment do not match!");
        console.log("Token uid on Bridge:");
        console.log(bridgeTokenList);
        console.log("Token uid in deployment:");
        console.log(tokenList);
      }
    });
  } catch(err) {
    console.log("%s", err);
  }
}

async function main() {
  let allEthConfigs = await getEthConfigs(L1ClientRole.Monitor);
  let ethConfigs = allEthConfigs.filter((config) => config.enabled);
  ethConfigs.forEach(async (config) => { await checkL1Deployment(config.chainName, config.deviceId) });
}

main();
