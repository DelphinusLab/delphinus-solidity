const Web3 = require("web3")
const FileSys = require("fs")
const SyncDB = require("./syncdb")
let contract_addr = "0x3E65f4e46d3dE8568B9a18BCe0eDc9Ac87CdC774";
let api_file = "build/contracts/CHECK.json";
SyncDB.track_events(contract_addr, api_file, v => {console.log(v);});
