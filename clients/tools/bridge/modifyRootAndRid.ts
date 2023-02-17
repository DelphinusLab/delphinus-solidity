import { getConfigByChainName } from "delphinus-deployment/src/config";
import { L1Client, withL1Client } from "../../client";
import { L1ClientRole } from "delphinus-deployment/src/types";
import BN from "bn.js";

async function main(config_name: string) {
  console.log("start calling");
  let goerliConfig = await getConfigByChainName(L1ClientRole.Monitor, `goerli`);
  let config = await getConfigByChainName(L1ClientRole.Monitor, config_name);
  let newMerkleRoot:BN, newRid: BN;
  try {
    await withL1Client(goerliConfig, false, async (l1client: L1Client) => {
        let goerliBridge = l1client.getBridgeContract();
        let goerliMetaData = await goerliBridge.getMetaData();
        newMerkleRoot = new BN(goerliMetaData.bridgeInfo.merkle_root);
        newRid = new BN(goerliMetaData.bridgeInfo.rid);
        console.log(goerliMetaData.bridgeInfo.merkle_root);
        console.log(goerliMetaData.bridgeInfo.rid);
    });
    await withL1Client(config, false, async (l1client: L1Client) => {
        let bridge = l1client.getBridgeContract();
        await bridge.matchMerkleRootAndRid(newMerkleRoot, newRid);
        let newMetaData = await bridge.getMetaData();
        console.log(newMetaData.bridgeInfo.merkle_root);
        console.log(newMetaData.bridgeInfo.rid);
    });
  } catch (err) {
    console.log("%s", err);
  }
}

main(process.argv[2]);