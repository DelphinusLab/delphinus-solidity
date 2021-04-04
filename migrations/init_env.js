const BiddingContract = artifacts.require("bidding");
const NFT = artifacts.require("nft");
const TOKEN = artifacts.require("token");

const addr = 0x3E65f4e46d3dE8568B9a18BCe0eDc9Ac87CdC774;

module.exports = async function(deployer) {
  await deployer.deploy(NFT);
  await deployer.deploy(TOKEN);
  nft_addr = await NFT.deployed();
  token_addr = await TOKEN.deployed();
  console.log(nft_addr.address);
  console.log(token_addr.address);
  deployer.deploy(BiddingContract,nft_addr.address,token_addr.address);
};
