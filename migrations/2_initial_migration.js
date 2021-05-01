const BiddingContract = artifacts.require("bidding");
const NFT = artifacts.require("nft");
const CHECK = artifacts.require("check");
const TOKEN = artifacts.require("token");
const Bridge = artifacts.require("bridge");

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
