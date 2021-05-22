const Config = require("../config")
const TokenInfo = require("../../build/contracts/Token.json")
const NFTInfo = require("../../build/contracts/NFT.json");
const BiddingInfo = require("../../build/contracts/Bidding.json");
const Client = require("web3subscriber/client");
const nft = require("./nft");


async function test_auctionInfo(id, price) {
  let web3 = await Client.initWeb3(Config, false);
  let account = Config.monitor_account;
  let nft_client = new nft.NftClient(web3, Config, TokenInfo, NFTInfo, BiddingInfo, account);
  try {
    let mint = await nft_client.mint(id);
    let auction = await nft_client.auction(id, price);
    // bid
    let auction_info = await nft_client.getAuctionInfo(id);
    console.log(auction_info);
   } catch (error) {
    let msg = error.message.split(':')
    console.log(msg[msg.length - 1]);
   }
}

test_auctionInfo(0x130, 16).then(v => {console.log("test done!"); process.exit();});
