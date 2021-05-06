const TOKEN = artifacts.require("Token");
const Bridge = artifacts.require("Bridge");

module.exports = async function(deployer) {
  await deployer.deploy(TOKEN);
  token_addr = await TOKEN.deployed();

  await deployer.deploy(Bridge, 0x1);
  bridge_addr = await Bridge.deployed();
};
