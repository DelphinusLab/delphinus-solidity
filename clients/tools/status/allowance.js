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
const client_1 = require("../../client");
const config_1 = require("delphinus-deployment/src/config");
const pbinder_1 = require("web3subscriber/src/pbinder");
const types_1 = require("delphinus-deployment/src/types");
function main(configName, targetAccount) {
    return __awaiter(this, void 0, void 0, function* () {
        let config = yield (0, config_1.getConfigByChainName)(types_1.L1ClientRole.Monitor, configName);
        let account = config.monitorAccount;
        let pbinder = new pbinder_1.PromiseBinder();
        let r = pbinder.return(() => __awaiter(this, void 0, void 0, function* () {
            yield (0, client_1.withL1Client)(config, false, (l1client) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let balance = yield l1client.web3.web3Instance.eth.getBalance(targetAccount);
                    console.log(`Balance ${balance}`);
                }
                catch (err) {
                    console.log("%s", err);
                }
            }));
        }));
        yield r.when("mint", "transactionHash", (hash) => console.log(hash));
    });
}
/* .once("transactionHash",hash => console.log(hash) */
main(process.argv[2], process.argv[3]);
//# sourceMappingURL=allowance.js.map