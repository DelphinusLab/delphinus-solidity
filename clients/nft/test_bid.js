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
    
    const balance_before = await token.methods.balanceOf(account).call();
    console.log("balance_before:", balance_before);
    if(balance_before < price) {
      console.log("balance is not enough!");
      return false;
    }

    await nft_client.auction(id, price-1);
    const token = await nft_client.token; 

    let auction_info_before = await nft_client.getAuctionInfo(id);
    console.log("auction_before", auction_info_before) 
    if(price <= Number(auction_info_before.price)) {
      console.log("bid:price is lower than original auction price");
      return false; 
    }
    let bid_tx = await nft_client.bid(id,price);
    auction_info_after = await nft_client.getAuctionInfo(id);
    console.log("auction_after", auction_info_after)
    if(Number(auction_info_after.price) > Number(auction_info_before.price)) {  
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
  await test_bid(0x165,10).then(v => {check_bid(v, true);});
  await test_bid(0x166, 5).then(v => {check_bid(v, true);});
  await test_bid(0x167, 5).then(v => {check_bid(v, true);});
  await test_bid(0x168, 5).then(v => {check_bid(v, true);});
  await test_bid(0x169, 5).then(v => {check_bid(v, true);});
  await test_bid(0x170, 5).then(v => {check_bid(v, true);});
  await test_bid(0x171, 5).then(v => {check_bid(v, true);});
  await test_bid(0x172, 5).then(v => {check_bid(v, true);});
  await test_bid(0x173, 5).then(v => {check_bid(v, true);});
  await test_bid(0x174, 5).then(v => {check_bid(v, true);});
  await test_bid(0x175, 5).then(v => {check_bid(v, true);});
  await test_bid(0x176, 5).then(v => {check_bid(v, true);});
  await test_bid(0x177, 5).then(v => {check_bid(v, true);});
  await test_bid(0x178, 5).then(v => {check_bid(v, true);});
  await test_bid(0x179, 5).then(v => {check_bid(v, true);});
  await test_bid(0x180, 5).then(v => {check_bid(v, true);});
  await test_bid(0x181, 5).then(v => {check_bid(v, true);});
  await test_bid(0x182, 5).then(v => {check_bid(v, true);});
  await test_bid(0x183, 5).then(v => {check_bid(v, true);});
  await test_bid(0x184, 5).then(v => {check_bid(v, true);});
  
}

bid().then(v => {process.exit();});
