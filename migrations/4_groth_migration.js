const Groth = artifacts.require("Groth");

module.exports = async function(deployer) {
  await deployer.deploy(Groth);
};
