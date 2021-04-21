const Web3 = require("web3")
const FileSys = require("fs")
const SyncDB = require("./tracker/syncdb")
const Config = require("./config")

let nft_api = "build/contracts/NFT.json";
let nft_event_tracker = new SyncDB.EventTracker("15", nft_api, Config, (n,v) => {
    console.log("track event: %s: {}", n, v);
  });
let promise = nft_event_tracker.reset_events();
Promise.all([promise]).then(v => {
  console.log("Done: rest events!");
  process.exit();
});
