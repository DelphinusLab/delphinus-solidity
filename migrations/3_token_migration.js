const TOKEN = artifacts.require("Token");
const RIO = artifacts.require("Rio");

module.exports = async function(deployer) {
  await deployer.deploy(TOKEN);
  token = await TOKEN.deployed();

  await deployer.deploy(RIO);
  token = await RIO.deployed();
};
