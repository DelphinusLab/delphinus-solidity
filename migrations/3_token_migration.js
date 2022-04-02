const TOKEN = artifacts.require("Token");
const GAS = artifacts.require("Gas");

module.exports = async function(deployer) {
  await deployer.deploy(TOKEN);
  token = await TOKEN.deployed();

  await deployer.deploy(GAS);
  token = await GAS.deployed();
};
