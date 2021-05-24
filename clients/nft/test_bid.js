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
    await nft_client.mint(id);
    const token = await nft_client.token; 
    const balance_before = await token.methods.balanceOf(account).call();
    console.log("balance_before:", balance_before);
    if(balance_before < price) {
      console.log("balance is not enough!");
      return false;
    }  
    await nft_client.auction(id, price-1);
    let bid_info_before = await nft_client.getAuctionInfo(id);
    console.log("bid_before", bid_info_before) 
    if(Number(bid_info_before.price) == 0) {
      console.log("Please auction at first")
      return false;
    }
    if(price <= Number(bid_info_before.price)) {
      console.log("bid:price is lower");
      return false; 
    }
    let bid_tx = await nft_client.bid(id,price);
    bid_info_after = await nft_client.getAuctionInfo(id);
    console.log("bid_after", bid_info_after)
    if(Number(bid_info_after.price) > Number(bid_info_before.price)) {  
      const balance_after = await token.methods.balanceOf(account).call();
      console.log("balance_after:", balance_after);
      if(balance_before-balance_after == price) {
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
     let msg = error.message.split(':')
     console.log(msg[msg.length - 1]);
     return false;
   }
}

function check_bid(result, indicator) {
  if(result == indicator){
    console.log("test correct");
  } else {
    console.log("test error");
  }
}

async function bid() {
  await test_bid(0x220, 5).then(v => {check_bid(v, true);});
  await test_bid(0x220, 5).then(v => {check_bid(v, false);});
  await test_bid(0x220, 4).then(v => {check_bid(v, false);});
  await test_bid(0x220, 6).then(v => {check_bid(v, true);});
  await test_bid(0x221, 5).then(v => {check_bid(v, true);});
  await test_bid(0x221, 5).then(v => {check_bid(v, false);});
  await test_bid(0x221, 4).then(v => {check_bid(v, false);});
  await test_bid(0x221, 6).then(v => {check_bid(v, true);});
  await test_bid(0x222, 5).then(v => {check_bid(v, true);});
  await test_bid(0x222, 5).then(v => {check_bid(v, true);});
  await test_bid(0x222, 5).then(v => {check_bid(v, true);});
  await test_bid(0x222, 5).then(v => {check_bid(v, false);});
  await test_bid(0x223, 4).then(v => {check_bid(v, false);});
  await test_bid(0x223, 6).then(v => {check_bid(v, true);});
  await test_bid(0x223, 5).then(v => {check_bid(v, false);});
  await test_bid(0x223, 4).then(v => {check_bid(v, false);});
  await test_bid(0x224, 6).then(v => {check_bid(v, true);});
  await test_bid(0x224, 5).then(v => {check_bid(v, false);});
  await test_bid(0x224, 4).then(v => {check_bid(v, false);});
  await test_bid(0x224, 6).then(v => {check_bid(v, true);});
}

bid().then(v => {process.exit();});
