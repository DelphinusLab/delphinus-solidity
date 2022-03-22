const Bridge = artifacts.require("Bridge");
const Withdraw = artifacts.require("Withdraw");
const Deposit = artifacts.require("Deposit");
const Supply = artifacts.require("Supply");
const Swap = artifacts.require("Swap");
const Retrive = artifacts.require("Retrive");
const AddPool = artifacts.require("AddPool");
const SetKey = artifacts.require("SetKey");
const DummyVerifier = artifacts.require("DummyVerifier");
const ZKPVerifier = artifacts.require("GrothVerifier");

module.exports = async function (deployer) {
  id = await web3.eth.net.getId();
  console.log("netid", id);

  await Promise.all([
    deployer.deploy(Bridge, id),
    deployer.deploy(ZKPVerifier, id),
    //deployer.deploy(DummyVerifier, id),
  ]);

  deposit = await Deposit.deployed();
  withdraw = await Withdraw.deployed();
  swap = await Swap.deployed();
  retrive = await Retrive.deployed();
  supply = await Supply.deployed();
  addpool = await AddPool.deployed();
  setkey = await SetKey.deployed();
  bridge = await Bridge.deployed();
  zkverifier = await ZKPVerifier.deployed();
  //dmverifier = await DummyVerifier.deployed();

  var tx = await bridge.addTransaction(deposit.address, false);
  tx = await bridge.addTransaction(withdraw.address, true);
  tx = await bridge.addTransaction(swap.address, false);
  tx = await bridge.addTransaction(supply.address, false);
  tx = await bridge.addTransaction(retrive.address, false);
  tx = await bridge.addTransaction(addpool.address, false);
  tx = await bridge.addTransaction(setkey.address, false);
  tx = await bridge.addVerifier(zkverifier.address);
  //tx = await bridge.addVerifier(dmverifier.address);
};
