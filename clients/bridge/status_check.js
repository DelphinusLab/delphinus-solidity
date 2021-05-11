const Web3 = require("web3")
const FileSys = require("fs")
const SyncDB = require("web3subscriber")
const Config = require("./config")

let web3 = new Web3(Config.web3_source);

function get_contract(abi_file) {
  let abi_data = FileSys.readFileSync(abi_file);
  let data_json = JSON.parse(abi_data);
  let abi_json = data_json.abi;
  let address = data_json.networks[Config.device_id].address;
  let contract = new web3.eth.Contract(abi_json, address, {
    from:Config.monitor_account
  });
  return contract;
}
let token = get_contract(Config.contracts + "/TOKEN.json");
let bridge = get_contract(Config.contracts + "/Bridge.json");

async function test_main() {
  console.log("start calling");
  try {
    let account = await bridge.methods.getAddress().call();
    let token_address = token.options.address;
    let balance = await token.methods.balanceOf(address).call();
    console.log("balance is", balance);
    balance = await bridge.methods.balanceOf(address).call();
    console.log("balance in bridge is", balance);
    let allowance = await token.methods.allowance(address, bridge.options.address).call();
    console.log("get allowance", allowance);
   } catch (err) {
    console.log("%s", err);
  }
}

test_main().then(v => console.log("test done!"));
