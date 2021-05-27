const BiddingContract = artifacts.require("Bidding");
const CHECK = artifacts.require("Check");

module.exports = async function(deployer) {
  await deployer.deploy(CHECK);
  check = await CHECK.deployed();
};
