const TOKEN = artifacts.require("token");
const Bridge = artifacts.require("bridge");

module.exports = async function(deployer) {
  await deployer.deploy(TOKEN);
  token_addr = await TOKEN.deployed();

  await deployer.deploy(Bridge, 0x1);
  bridge_addr = await Bridge.deployed();
};
