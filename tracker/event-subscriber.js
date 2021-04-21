const Web3 = require("web3")
const FileSys = require("fs")
const SyncDB = require("./syncdb")
const Config = require("./config")

let device_id = process.argv[2]
let api_file = process.argv[3]

let nft_event_tracker = new SyncDB.EventTracker(device_id, api_file, Config, (n,v) => {
    console.log("track event: %s: {}", n, v);
  });
let promise = nft_event_tracker.subscribe_events();

Promise.all([promise]).then(v => {
  console.log("start subscribe events:");
});
