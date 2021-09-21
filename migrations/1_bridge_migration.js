const Bridge = artifacts.require("Bridge");
const Withdraw = artifacts.require("Withdraw");
const Deposit = artifacts.require("Deposit");
const Supply = artifacts.require("Supply");
const Swap = artifacts.require("Swap");
const Retrive = artifacts.require("Retrive");
const AddPool = artifacts.require("AddPool");

module.exports = async function(deployer) {
  id = await web3.eth.net.getId();
  console.log("netid", id);

  await deployer.deploy(Deposit);
  deposit = await Deposit.deployed();

  await deployer.deploy(Withdraw);
  withdraw = await Withdraw.deployed();

  await deployer.deploy(Swap);
  swap = await Swap.deployed();

  await deployer.deploy(Supply);
  supply = await Supply.deployed();

  await deployer.deploy(Retrive);
  retrive = await Retrive.deployed();

  await deployer.deploy(AddPool);
  addpool = await AddPool.deployed();

  await deployer.deploy(Bridge, id);
  bridge = await Bridge.deployed();

  var tx = await bridge.addTransaction(deposit.address);
  tx = await bridge.addTransaction(withdraw.address);
  tx = await bridge.addTransaction(swap.address);
  tx = await bridge.addTransaction(supply.address);
  tx = await bridge.addTransaction(retrive.address);
  tx = await bridge.addTransaction(addpool.address);
};
