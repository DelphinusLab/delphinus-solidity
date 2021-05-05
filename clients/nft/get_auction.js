const Config = require("../config")
const TokenInfo = require("../../build/contracts/Token.json")
const NFTInfo = require("../../build/contracts/NFT.json");
const BiddingInfo = require("../../build/contracts/Bidding.json");
const Client = require("web3subscriber/client");
const nft = require("./nft");


async function test_owner() {
  let web3 = await Client.initWeb3(Config, false);
  let account = Config.monitor_account;
  let nft_client = new nft.NftClient(web3, Config, TokenInfo, NFTInfo, BiddingInfo, account);
  try {
    let auction_info = await nft_client.getAuctionInfo(0x1);
    console.log(auction_info);
   } catch (error) {
    let msg = error.message.split(':')
    console.log(msg[msg.length - 1]);
   }
}

test_owner().then(v => {console.log("test done!"); process.exit();});
