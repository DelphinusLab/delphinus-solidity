const Bridge = artifacts.require("Bridge");
const Withdraw = artifacts.require("Withdraw");
const Deposit = artifacts.require("Deposit");
const Supply = artifacts.require("Supply");

module.exports = async function(deployer) {
  id = await web3.eth.net.getId();
  console.log("netid", id);

  await deployer.deploy(Withdraw);
  withdraw = await Withdraw.deployed();

  await deployer.deploy(Deposit);
  deposit = await Deposit.deployed();

  await deployer.deploy(Supply);
  supply = await Supply.deployed();

  await deployer.deploy(Bridge, id);
  bridge = await Bridge.deployed();

  var tx = await bridge.add_verifier(withdraw.address);
  tx = await bridge.add_verifier(deposit.address);
  tx = await bridge.add_verifier(supply.address);
};
