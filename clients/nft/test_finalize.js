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
    await nft_client.mint(id);
    const token = await nft_client.token; 
    const balance_before = await token.methods.balanceOf(account).call();
    if(balance_before < price) {
      console.log("balance is not enough!");
      return false;
    }  
    await nft_client.auction(id, price-1);
    let bid_info_before = await nft_client.getAuctionInfo(id);
    if(Number(bid_info_before.price) == 0) {
      console.log("Please auction at first")
      return false;
    }
    if(price <= Number(bid_info_before.price)) {
      console.log("bid:price is lower");
      return false; 
    }
    await nft_client.bid(id,price);
    let bid_info_after = await nft_client.getAuctionInfo(id);
    if(Number(bid_info_after.price) > Number(bid_info_before.price)) {  
      const balance_after = await token.methods.balanceOf(account).call();
      if(balance_before-balance_after != price) {
        console.log("bid:current balance is not correct!");
        return false;
      }
    } else {
      console.log("bid failed");
      return false;
    }

    let auction_before_finalize = await nft_client.getAuctionInfo(id);
    console.log("auction_before_finalize:",auction_before_finalize);
    await nft_client.finalize(id);
    
    let auction_after_finalize = await nft_client.getAuctionInfo(id);
    console.log("auction_after_finalize:", auction_after_finalize);
    if(auction_after_finalize.price == 0 && auction_after_finalize.owner == 0 &&  auction_after_finalize.winner == 0) {
      return true;
    } else {
      console.log("finalize failed")
      return false;
    }
   } catch (error) {
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
