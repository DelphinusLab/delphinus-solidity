const NFT = artifacts.require("nft");
const TOKEN = artifacts.require("token");
const BiddingContract = artifacts.require("bidding");
const CHECK = artifacts.require("check");

contract("Testing NFT Mint", async (accounts) => {
  let bidding;
  let nft;

  before('setup contract', async() => {
    // Initialize Config
    bidding = await BiddingContract.deployed();
    nft = await NFT.deployed();
    token = await TOKEN.deployed();
    check = await CHECK.deployed();
  })

  console.log("testing ...");

  it("Should Register Oracles Successfully", async () => {
    await nft.test_mint(0x2f);
    await token.mint(0x100);
    let owner = await nft.ownerOf(0x2f);
    console.log(owner);

    let b = await token.getBalance();
    console.log("get balance of owner", b);

    await bidding.auction(0x2f);
    console.log("auction started:");
    let bidinfo = await bidding.get_bidding(0x2f);
    console.log("winner is ", bidinfo.winner);

    token.approve(bidding.address, 0x2f);
    let bid = await bidding.bidding(0x2f, 0x10);
    bidinfo = await bidding.get_bidding(0x2f);
    console.log("winner is", bidinfo.winner);
  })
})

