const Web3 = require("web3")
const FileSys = require("fs")
const SyncDB = require("./tracker/syncdb")
let nft_addr = "0x3FF42fb199E8FC6C88Abe85ed5C28323aa26Bcf7"
let nft_api = "build/contracts/NFT.json";
let promise = SyncDB.reset_events(nft_addr, nft_api);
promise.then(v => {console.log("Done: reset events!");});
