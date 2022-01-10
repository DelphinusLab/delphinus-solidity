import { getConfigByChainName } from "delphinus-deployment/src/config";
import { L1Client, withL1Client } from "../../client";
import { encodeL1address } from "web3subscriber/src/addresses";
import { Tokens } from "../../contracts/tokenlist";
import { L1ClientRole } from "delphinus-deployment/src/types";

async function main(config_name: string) {
  console.log("start calling");
  let config = await getConfigByChainName(L1ClientRole.Monitor, config_name);
  try {
    await withL1Client(config, false, async (l1client: L1Client) => {
      let bridge = l1client.getBridgeContract();
      console.log("Testing bridge [id=%s]", l1client.getChainIdHex());
      let cid = parseInt(l1client.getChainIdHex()).toString(16);
      for (let x of Tokens) {
        let tid = encodeL1address(x.address, parseInt(x.chainId).toString(16))
        console.log("token tid: 0x", tid.toString(16));
        if (x.chainId == cid) {
            let tc = l1client.getTokenContract(x.address);
            let balance = await tc.balanceOf(bridge.address());
            console.log("balance is", balance);
        } else {
            console.log("nonative", x.chainId);
        }
      };
      let metadata = await bridge.getMetaData();
      console.log("metadata:", metadata);
      console.log(metadata.bridgeInfo.rid);
    });
  } catch (err) {
    console.log("%s", err);
  }
}

main(process.argv[2]).then(v => {process.exit();})
