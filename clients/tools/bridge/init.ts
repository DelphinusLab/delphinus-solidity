import { getConfigByChainName } from "delphinus-deployment/src/config";
import { L1Client, withL1Client } from "../../client";
import { encodeL1address } from "web3subscriber/src/addresses";
import { extraTokens, contractsInfo} from "delphinus-deployment/config/contractsinfo";
import { L1ClientRole } from "delphinus-deployment/src/types";

const fs = require("fs");
const path = require("path");

function crunchTokens() {
  return contractsInfo.tokens.concat(extraTokens)
    .filter((x: any) => x.address)
    .map((x: any) =>
    encodeL1address(x.address, parseInt(x.chainId).toString(16))
    );
}

async function main(config_name: string) {
  console.log("start calling");
  let config = await getConfigByChainName(L1ClientRole.Monitor, config_name);
  try {
    await withL1Client(config, false, async (l1client: L1Client) => {
      let bridge = l1client.getBridgeContract();
      let existing_tokens = await bridge.allTokens();
      let init_tokens = crunchTokens();
      let output: any = {};
      let index = 0;
      console.log("Init tokens in bridge [id=%s]", l1client.getChainIdHex());
      console.log("Existing tokens:");
      for (let tokenUid of crunchTokens()) {
        let uidstr = tokenUid.toString(16);
        if (index < existing_tokens.length) {
            console.log(`Existing token uid: ${existing_tokens[index]}`);
            if (existing_tokens[index].token_uid !== tokenUid.toString()) {
                console.log("Token does not match", existing_tokens[index].token_uid, tokenUid.toString());
                process.exit();
            }
        } else {
          console.log(`Adding token uid: ${tokenUid.toString(16)}`);
          let tx = await bridge.addToken(tokenUid);
          console.log(tx);
        }
        output[tokenUid.toString()] = index++;
      }

      fs.writeFileSync(
        path.resolve(__dirname, "../../../../deployment/config", "token-index.json"),
        JSON.stringify(output, undefined, 2)
      );

      let info = await bridge.getBridgeInfo();
      console.log("bridge info is", info);
      let tokens = await bridge.allTokens();
      console.log("token list is", tokens);
    });
  } catch (err) {
    console.log("%s", err);
  }
}

main(process.argv[2]);
