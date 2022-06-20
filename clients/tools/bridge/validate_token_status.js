"use strict";
//Run command example: tsc; node validate_token_status.js ropsten
//It will check that the tokens' addresses listed in deployment/config/token-index.json match the token addresses in Bridge Contract
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("delphinus-deployment/src/config");
const client_1 = require("../../client");
const types_1 = require("delphinus-deployment/src/types");
const fs_extra_1 = __importDefault(require("fs-extra"));
const tokenList = fs_extra_1.default.readJsonSync("../../../node_modules/delphinus-deployment/config/token-index.json");
function main(config_name) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Begin validation:");
        let config = yield (0, config_1.getConfigByChainName)(types_1.L1ClientRole.Monitor, config_name);
        try {
            yield (0, client_1.withL1Client)(config, false, (l1client) => __awaiter(this, void 0, void 0, function* () {
                let bridge = l1client.getBridgeContract();
                console.log("Grabbing meta for bridge [id=%s] %s", l1client.getChainIdHex(), config_name);
                let metadata = yield bridge.getMetaData();
                //console.log("metadata:", metadata);
                let bridgeTokenList = {};
                let count = 0;
                metadata.tokens.forEach((token) => {
                    //Check token_uid existing in the deployment token-index.json and all match
                    bridgeTokenList[token.token_uid] = count++;
                });
                if (JSON.stringify(tokenList) == JSON.stringify(bridgeTokenList))
                    console.log("Validation Success!");
                else {
                    console.log("Validation Failed.");
                    console.log("Token uid on Bridge:");
                    console.log(bridgeTokenList);
                    console.log("Token uid in deployment:");
                    console.log(tokenList);
                }
            }));
        }
        catch (err) {
            console.log("%s", err);
        }
    });
}
main(process.argv[2]).then(v => { process.exit(); });
//# sourceMappingURL=validate_token_status.js.map