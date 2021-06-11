const Groth = artifacts.require("groth");

module.exports = async function(deployer) {
  await deployer.deploy(Groth);
};
