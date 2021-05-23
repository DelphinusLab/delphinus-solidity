const TOKEN = artifacts.require("Token");
const Bridge = artifacts.require("Bridge");
const Withdraw = artifacts.require("Withdraw");

module.exports = async function(deployer) {
  id = await web3.eth.net.getId();
  console.log(id);

  await deployer.deploy(TOKEN);
  token = await TOKEN.deployed();

  await deployer.deploy(Withdraw);
  console.log(Withdraw.depolyed);
  withdraw = await Withdraw.deployed();

  await deployer.deploy(Bridge, id);
  bridge = await Bridge.deployed();

  let tx = bridge.add_verifier(withdraw.address);
  console.log(tx);
};
