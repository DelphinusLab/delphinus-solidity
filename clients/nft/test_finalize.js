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
    //await nft_client.mint(id);
    //var auction = wait nft_client.auction(id, price);
    //wait nft_client.bid(id, price);
    var auctionInfo = await nft_client.auction(id, price);
    console.log("before:", auctionInfo)
    let finalize_tx = await nft_client.finalize(id);
    console.log(finalize_tx);
    var lastAuctionInfo = await nft_client.auction(id, price);
    console.log("after:", auctionInfo)
    if(lastAuctionInfo.winnner != auctionInfo.winner) {
      return true;
    } else {
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
  await test_finalize(0x156, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x157, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x158, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x159, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x160, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x161, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x162, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x163, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x164, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x165, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x166, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x167, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x168, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x169, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x170, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x171, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x172, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x173, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x174, 23).then(v => {check_finalize(v, true);});
  await test_finalize(0x175, 23).then(v => {check_finalize(v, true);});
}

finalize().then(v => {process.exit();});
