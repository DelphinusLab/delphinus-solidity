const Config = require("../config")
const TokenInfo = require("../../build/contracts/Token.json")
const NFTInfo = require("../../build/contracts/NFT.json");
const BiddingInfo = require("../../build/contracts/Bidding.json");
const Client = require("web3subscriber/client");
const nft = require("./nft");


async function test_auction(id, price) {
  let web3 = await Client.initWeb3(Config, false);
  let account = Config.monitor_account;
  let nft_client = new nft.NftClient(web3, Config, TokenInfo, NFTInfo, BiddingInfo, account);
  try {
   // var mint_tx = await nft_client.mint(id); 
    await nft_client.auction(id, price);
    let auction_info = await nft_client.getAuctionInfo(id);
    console.log(auction_info);
    if (auction_info.price == price) {
      return true;
    } else {
      return false;
    }
   } catch (error) {
      let msg = error.message.split(':');
      console.log(msg[msg.length - 1]);
      return false;
   }
}

function check_test(result, indicator) {
  if(result == indicator){
    console.log("test correct");
  } else {
    console.log("test error");
  }
}

async function tests() {
  await test_auction(0x152, 20).then(v => {check_test(v, true);});
  await test_auction(0x152, 10).then(v => {check_test(v, false);});
  await test_auction(0x152, 30).then(v => {check_test(v, false);});
  await test_auction(0x152, 20).then(v => {check_test(v, false);});
 /* await test_auction(0x149, 20).then(v => {check_test(v, true);});
  await test_auction(0x149, 10).then(v => {check_test(v, false);});
  await test_auction(0x149, 30).then(v => {check_test(v, false);});
  await test_auction(0x149, 20).then(v => {check_test(v, false);});
  await test_auction(0x150, 20).then(v => {check_test(v, true);});
  await test_auction(0x150, 10).then(v => {check_test(v, false);});
  await test_auction(0x150, 30).then(v => {check_test(v, false);});
  await test_auction(0x150, 20).then(v => {check_test(v, false);});
  await test_auction(0x151, 20).then(v => {check_test(v, true);});
  await test_auction(0x151, 10).then(v => {check_test(v, false);});
  await test_auction(0x151, 30).then(v => {check_test(v, false);});
  await test_auction(0x151, 20).then(v => {check_test(v, false);});*/
}
tests().then(v => {process.exit();});
