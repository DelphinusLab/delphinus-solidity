const Config = require("../config")
const TokenInfo = require("../../build/contracts/Token.json")
const NFTInfo = require("../../build/contracts/NFT.json");
const BiddingInfo = require("../../build/contracts/Bidding.json");
const Client = require("web3subscriber/client");
const nft = require("./nft");


async function test_bid(id, price) {
  let web3 = await Client.initWeb3(Config, false);
  let account = Config.monitor_account;
  let nft_client = new nft.NftClient(web3, Config, TokenInfo, NFTInfo, BiddingInfo, account);
  try { 
    await nft_client.mint(id); // mint before auction 
    var token = await nft_client.token; 
    var balance_before = await token.methods.balanceOf(account).call(); // get balance before auction
    console.log("balance_before:", balance_before);
    if(balance_before < price) { // the price must be greater than the balance
      console.log("balance is not enough!");
      return false;
    }
    let auction_info_before = await nft_client.getAuctionInfo(id); 
    console.log("auction_before", auction_info_before)
    if(auction_info_before.owner != 0) {  // owner should equal to zero 
        console.log("auction has already succeed");
        return false;
    }
    await nft_client.auction(id, price-1); // auction before bid & the bid price must be higher than the auction 
    auction_info_after = await nft_client.getAuctionInfo(id);
    console.log("auction_after:",auction_info_after);
    if (Number(auction_info_after.price) != price-1) { // the price should be updated
      console.log("auction failed");
      return false;
    }
    await nft_client.bid(id,price);
    bid_info_after = await nft_client.getAuctionInfo(id); 
    console.log("bid_after", bid_info_after)
    if(Number(bid_info_after.price) > Number(auction_info_after.price)) { //the price shoud be updated  
      const balance_after = await token.methods.balanceOf(account).call();
      console.log("balance_after:", balance_after);
      if(balance_before-balance_after == price) { // The number of reductions should be equal to price
        return true;
      } else {
        console.log("bid:current balance is not correct!");
        return false;
      }
    } else {
      console.log("bid:bid failed!");
      return false;
    }
   } catch (error) {
     if(token){
      let current_balance = await token.methods.balanceOf(account).call();
      if(current_balance != balance_before) { // if bid failed, balance should not decrease
        console.log("bid:balance decreased");
        return false;
      }
     }
     let msg = error.message.split(':')
     console.log(msg[msg.length - 1]);
     return false;
   }
}
// test the result of test_bid
function check_bid(result, indicator) {
  if(result == indicator){
    console.log("test correct");
  } else {
    console.log("test error");
  }
}
// test case
async function bid() {
  await test_bid(0x225, 5).then(v => {check_bid(v, true);});
  await test_bid(0x225, 5).then(v => {check_bid(v, false);});
  await test_bid(0x225, 4).then(v => {check_bid(v, false);});
  await test_bid(0x225, 6).then(v => {check_bid(v, false);});
  await test_bid(0x226, 5).then(v => {check_bid(v, true);});
  await test_bid(0x226, 5).then(v => {check_bid(v, false);});
  await test_bid(0x226, 4).then(v => {check_bid(v, false);});
  await test_bid(0x226, 6).then(v => {check_bid(v, false);});
  await test_bid(0x227, 5).then(v => {check_bid(v, true);});
  await test_bid(0x227, 5).then(v => {check_bid(v, false);});
  await test_bid(0x227, 4).then(v => {check_bid(v, false);});
  await test_bid(0x227, 6).then(v => {check_bid(v, false);});
  await test_bid(0x228, 5).then(v => {check_bid(v, true);});
  await test_bid(0x228, 5).then(v => {check_bid(v, false);});
  await test_bid(0x228, 4).then(v => {check_bid(v, false);});
  await test_bid(0x228, 6).then(v => {check_bid(v, false);});
  await test_bid(0x229, 5).then(v => {check_bid(v, true);});
  await test_bid(0x229, 5).then(v => {check_bid(v, false);});
  await test_bid(0x229, 4).then(v => {check_bid(v, false);});
  await test_bid(0x229, 6).then(v => {check_bid(v, false);});
}

bid().then(v => {process.exit();});
