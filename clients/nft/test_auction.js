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
    var mint_tx = await nft_client.mint(id); 
    const token = await nft_client.token; 
    const balance = await token.methods.balanceOf(account).call();
    console.log("balance:", balance);
    if(balance < price) {
      console.log("balance is not enough!");
      return false;
    }
    let auction_info_before = await nft_client.getAuctionInfo(id);
    console.log("auction_before", auction_info_before)
    if(auction_info_before.owner != 0) {
        console.log("auction has already succeed");
        return false;
    }
    await nft_client.auction(id, price);
    auction_info_after = await nft_client.getAuctionInfo(id);
    console.log("auction_after:",auction_info_after);
    if (Number(auction_info_after.price) == price) {
      console.log("auction succeed");
      return true;
    } else {
      console.log("auction failed");
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
  await test_auction(0x6, 2).then(v => {check_test(v, true);})
  await test_auction(0x6, 1).then(v => {check_test(v, false);})
  await test_auction(0x6, 3).then(v => {check_test(v, false);})
  await test_auction(0x6, 2).then(v => {check_test(v, false);})
  await test_auction(0x7, 2).then(v => {check_test(v, true);})
  await test_auction(0x7, 1).then(v => {check_test(v, false);})
  await test_auction(0x7, 3).then(v => {check_test(v, false);})
  await test_auction(0x7, 2).then(v => {check_test(v, false);})
  await test_auction(0x8, 2).then(v => {check_test(v, true);})
  await test_auction(0x8, 1).then(v => {check_test(v, false);})
  await test_auction(0x8, 3).then(v => {check_test(v, false);})
  await test_auction(0x8, 2).then(v => {check_test(v, false);})
  await test_auction(0x9, 2).then(v => {check_test(v, true);})
  await test_auction(0x9, 1).then(v => {check_test(v, false);})
  await test_auction(0x9, 3).then(v => {check_test(v, false);})
  await test_auction(0x9, 2).then(v => {check_test(v, false);})
  await test_auction(0x10, 2).then(v => {check_test(v, true);})
  await test_auction(0x10, 1).then(v => {check_test(v, false);})
  await test_auction(0x10, 3).then(v => {check_test(v, false);})
  await test_auction(0x10, 2).then(v => {check_test(v, false);})
}
tests().then(v => {process.exit();});
