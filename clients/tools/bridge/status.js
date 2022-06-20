"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("delphinus-deployment/src/config");
const client_1 = require("../../client");
const addresses_1 = require("web3subscriber/src/addresses");
const contractsinfo_1 = require("delphinus-deployment/config/contractsinfo");
const types_1 = require("delphinus-deployment/src/types");
function main(config_name) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("start calling");
        let config = yield (0, config_1.getConfigByChainName)(types_1.L1ClientRole.Monitor, config_name);
        try {
            yield (0, client_1.withL1Client)(config, false, (l1client) => __awaiter(this, void 0, void 0, function* () {
                let bridge = l1client.getBridgeContract();
                console.log("Testing bridge [id=%s]", l1client.getChainIdHex());
                let cid = parseInt(l1client.getChainIdHex()).toString(16);
                for (let x of contractsinfo_1.contractsInfo.tokens) {
                    let tid = (0, addresses_1.encodeL1address)(x.address, parseInt(x.chainId).toString(16));
                    console.log("token tid: 0x", tid.toString(16));
                    if (x.chainId == cid) {
                        let tc = l1client.getTokenContract(x.address);
                        let balance = yield tc.balanceOf(bridge.address());
                        console.log("balance is", balance);
                    }
                    else {
                        console.log("nonative", x.chainId);
                    }
                }
                ;
                let metadata = yield bridge.getMetaData();
                console.log("metadata:", metadata);
                console.log(metadata.bridgeInfo.rid);
            }));
        }
        catch (err) {
            console.log("%s", err);
        }
    });
}
main(process.argv[2]).then(v => { process.exit(); });
//# sourceMappingURL=status.js.map