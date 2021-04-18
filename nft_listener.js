const Web3 = require("web3")
const FileSys = require("fs")
const SyncDB = require("./tracker/syncdb")
let nft_addr = "0x3FF42fb199E8FC6C88Abe85ed5C28323aa26Bcf7"
let nft_api = "build/contracts/NFT.json";
let promise = SyncDB.track_events(nft_addr, nft_api, (n,v) => {
    console.log("track event: %s: {}", n, v);
});

Promise.all([promise]).then(v => {
  console.log("finished sync events!");
  process.exit();
});
