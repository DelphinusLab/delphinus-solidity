const Web3 = require("web3")
const FileSys = require("fs")
const Client = require("web3subscriber/client");
const EthConfig = require('../config');
const BridgeABI = require('./abi');
const BN = Web3.utils.BN;
const DepositVerifier = require("../../build/contracts/Deposit.json");

const test_config = {
  l2account: "0x7a50c8fa50a39bd48dfd8053ebff44ba3da45dd8c3e90a5fec9fd73a4595251b",
}

async function test_main() {
  console.log("start calling");
  try {
    let bridge = await BridgeABI.getBridge(EthConfig, false)
    verify_info = await bridge.getVerifierInfo(0);
    console.log("verifier info at zero", verify_info);
    verify_info = await bridge.getVerifierInfo(1);
    console.log("verifier info at one", verify_info);
    let c = (new BN(1)).shln(31*8);
    let l2 = (new BN(1));
    let tid = (new BN(1));
    let amount = (new BN(1));
    let transfer_amount = (new BN(1));
    let web3 = await Client.initWeb3(EthConfig, false);
    let account = await Client.getDefaultAccount(web3, EthConfig);
    let args = [c, l2, tid, amount, transfer_amount];
    var verifier = Client.getContract(web3, EthConfig, DepositVerifier, account);
    let info = await verifier.methods.getVerifierInfo().call();
    console.log("verifiy info:", info);
    let arg = await verifier.methods.testArgument(1,args).call();
    console.log("verifiy info:", arg);
    let verify = await verifier.methods.verify(args, 1).call();
    console.log("verify", verify);
    let t = await bridge.verify(test_config.l2account, args, new BN(1), new BN(2));
    console.log(t);
  } catch (err) {
    console.log("%s", err);
  }
}

test_main().then(v => console.log("test done!"));
