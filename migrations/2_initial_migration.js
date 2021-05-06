const BiddingContract = artifacts.require("Bidding");
const NFT = artifacts.require("NFT");
const CHECK = artifacts.require("CHECK");
const TOKEN = artifacts.require("Token");
const Bridge = artifacts.require("Bridge");

module.exports = async function(deployer) {
  await deployer.deploy(TOKEN);
  token_addr = await TOKEN.deployed();

  await deployer.deploy(NFT);
  nft_addr = await NFT.deployed();

  await deployer.deploy(CHECK);
  check_addr = await CHECK.deployed();

  console.log(nft_addr.address);
  console.log(token_addr.address);
  console.log(check_addr.address);

  await deployer.deploy(BiddingContract,token_addr.address,nft_addr.address);

};
