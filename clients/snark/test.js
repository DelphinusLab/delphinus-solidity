const Web3 = require("web3")
const FileSys = require("fs")
const Config = require("../config")
const Client = require("web3subscriber/client")
const Groth = require("../../build/contracts/Groth.json")
const snarkproof = require("./proof.json")

console.log("snark", snarkproof);


async function test_snark(config_name) {
  config = Config[config_name];
  let account = config.monitor_account;
  let web3 = await Client.initWeb3(config, false);
  let snark = Client.getContract(web3, config, Groth, account);
  try {
    let test = await snark.methods.verifyDelphinusTx(snarkproof.proof.a,
      snarkproof.proof.b,
      snarkproof.proof.c,
      snarkproof.inputs
    ).call();
    console.log("snark proof", test);
  } catch (err) {
    console.log("%s", err);
  }
}


console.log(Config[process.argv[2]]);
test_snark(process.argv[2]).then(v => {console.log("test done!"); process.exit();});
