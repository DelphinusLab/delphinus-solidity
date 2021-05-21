const TOKEN = artifacts.require("Token");
const Bridge = artifacts.require("Bridge");
const Withdraw = artifacts.require("Withdraw");

module.exports = async function(deployer) {
  await deployer.deploy(TOKEN);
  token = await TOKEN.deployed();

  await deployer.deploy(Withdraw);
  console.log(Withdraw.depolyed);
  withdraw = await Withdraw.deployed();

  await deployer.deploy(Bridge, 0x1);
  bridge = await Bridge.deployed();

  let tx = bridge.add_verifier(withdraw.address);
  console.log(tx);
};
