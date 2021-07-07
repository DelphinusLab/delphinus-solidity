const BiddingContract = artifacts.require("Bidding");
const NFT = artifacts.require("NFT");
const TOKEN = artifacts.require("Token");

module.exports = async function(deployer) {
  await deployer.deploy(TOKEN);
  token_addr = await TOKEN.deployed();

  await deployer.deploy(NFT);
  nft_addr = await NFT.deployed();

  console.log(nft_addr.address);
  console.log(token_addr.address);

  await deployer.deploy(BiddingContract,token_addr.address,nft_addr.address);

};
