const Config = require("../config")
const TokenInfo = require("../../build/contracts/Token.json")
const NFTInfo = require("../../build/contracts/NFT.json");
const BiddingInfo = require("../../build/contracts/Bidding.json");
const Client = require("web3subscriber/client");
const nft = require("./nft");
const Utils = require("../utils");


async function test_nft() {
  let web3 = await Client.initWeb3(Config, true);
  let accounts = await web3.eth.getAccounts();
  let account = accounts[0];
  let nft_client = new nft.NftClient(web3, Config, TokenInfo, NFTInfo, BiddingInfo, account);
  try {
    let mint_tx = await nft_client.mint(0x345);
    let owner = await nft_client.getOwner(0x345);
    Utils.info("Owner is:" + owner);
    let info = await nft_client.getAuctionInfo(0x345);
    Utils.info("Bidding info:" + info.price);
    //return mint_tx;
  } catch (error) {
    Utils.info(error.message);
  }
}

module.exports = {
  test: test_nft,
}
