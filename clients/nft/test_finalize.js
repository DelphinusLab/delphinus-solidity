const Config = require("../config")
const TokenInfo = require("../../build/contracts/Token.json")
const NFTInfo = require("../../build/contracts/NFT.json");
const BiddingInfo = require("../../build/contracts/Bidding.json");
const Client = require("web3subscriber/client");
const nft = require("./nft");


async function test_finalize(id, price) {
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
    var alreadyBid = true;
    await nft_client.bid(id,price); // bid before finalize
    bid_info_after = await nft_client.getAuctionInfo(id); 
    console.log("bid_after", bid_info_after)
    if(Number(bid_info_after.price) > Number(auction_info_after.price)) { //the price shoud be updated  
      const balance_after = await token.methods.balanceOf(account).call();
      console.log("balance_after:", balance_after);
      if(balance_before-balance_after != price) { // The number of reductions should be equal to price
        console.log("bid:current balance is not correct!");
        return false;
      }
    } else {
      console.log("bid:bid failed!");
      return false;
    }
    let owner_before_finalize = await nft_client.getOwner(id);
    console.log("owner_before_finalize",owner_before_finalize);
    await nft_client.finalize(id);
    let owner_after_finalize = await nft_client.getOwner(id);
    console.log("owner_after_finalize:", owner_after_finalize); 
    let auctionInfo_after_finalize = await nft_client.getAuctionInfo(id);
    console.log("auctionInfo_after_finalize:", auctionInfo_after_finalize);
    if(auctionInfo_after_finalize.price == 0 && auctionInfo_after_finalize.owner == 0 &&  auctionInfo_after_finalize.winner == 0) {
      if(owner_after_finalize == owner_before_finalize) { // owner should be updated
        console.log("owner did not updated");
        return false;
      } else {
        return true;
      }
    } else {
      console.log("finalize failed")
      return false;
    }
   } catch (error) { 
     let current_balance = await token.methods.balanceOf(account).call();
     if(current_balance != balance_before && alreadyBid) { // if bid failed, balance should not decrease
       console.log("bid:balance decreased");
       return false;
     }
     let msg = error.message.split(':')
     console.log(msg[msg.length - 1]);
     return false;
   }
}

function check_finalize(result, indicator) {
  if(result == indicator){
    console.log("test correct");
  } else {
    console.log("test error");
  }
}

async function finalize() {
  await test_finalize(0x256, 6).then(v => {check_finalize(v, true);});
  await test_finalize(0x233, 6).then(v => {check_finalize(v, true);});
  await test_finalize(0x234, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x235, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x236, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x237, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x238, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x239, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x240, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x241, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x242, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x243, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x244, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x245, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x246, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x247, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x248, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x249, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x250, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x251, 5).then(v => {check_finalize(v, true);});
  await test_finalize(0x252, 5).then(v => {check_finalize(v, true);});
}

finalize().then(v => {process.exit();});
