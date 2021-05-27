const TOKEN = artifacts.require("Token");
const Bridge = artifacts.require("Bridge");
const Withdraw = artifacts.require("Withdraw");
const Deposit = artifacts.require("Deposit");

module.exports = async function(deployer) {
  id = await web3.eth.net.getId();
  console.log("netid", id);

  await deployer.deploy(TOKEN);
  token = await TOKEN.deployed();

  await deployer.deploy(Withdraw);
  console.log(Withdraw.depolyed);
  withdraw = await Withdraw.deployed();

  await deployer.deploy(Deposit);
  console.log(Deposit.depolyed);
  deposit = await Deposit.deployed();

  await deployer.deploy(Bridge, id);
  bridge = await Bridge.deployed();

  var tx = bridge.add_verifier(withdraw.address);
  tx = bridge.add_verifier(deposit.address);
};
