const Config = require("../config")
const TokenInfo = require("../../build/contracts/Token.json")
const NFTInfo = require("../../build/contracts/NFT.json");
const BiddingInfo = require("../../build/contracts/Bidding.json");
const Client = require("web3subscriber/client");
const nft = require("./nft");

async function test_auction(config, id, price) {
  let web3 = await Client.initWeb3(config, false);
  let account = config.monitor_account;
  let nft_client = new nft.NftClient(web3, config, TokenInfo, NFTInfo, BiddingInfo, account);
  try {
    var mint_tx = await nft_client.mint(id); // mint before auction
    const token = await nft_client.token;
    const balance = await token.methods.balanceOf(account).call(); // get balance before auction
    console.log("balance:", balance);
    if(balance < price) { // the price must be greater than the balance
      console.log("balance is not enough!");
      return false;
    }
    let auction_info_before = await nft_client.getAuctionInfo(id);
    console.log("auction_before", auction_info_before)
/*
    if(auction_info_before.owner != 0) {  // owner should equal to zero
        console.log("auction has already succeed");
        return false;
    }
*/
    await nft_client.auction(id, price).when("auction","sending",()=>{
      console.log("sending auction transaction ...");
    }).when("auction","sent", ()=>{
      console.log("transaction is sent, waiting for process ...");
    }).when("approve","sending", ()=>{
      console.log("waiting for approve ...");
    }).when("auction", "transactionHash", hash=> {
      console.log("transaction hash:", hash);
    });
    auction_info_after = await nft_client.getAuctionInfo(id);
    console.log("auction_after:",auction_info_after);
    if (Number(auction_info_after.price) == price) { // the price should be updated
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
// test the result of test_auction
function check_test(result, indicator) {
  if(result == indicator){
    console.log("test correct");
  } else {
    console.log("test error");
  }
}
// test case
async function tests(config_name) {
  let config = Config[config_name];
  await test_auction(config, 0x18, 2).then(v => {check_test(v, true);})
/*
  await test_auction(config, 0x6, 1).then(v => {check_test(v, false);})
  await test_auction(config, 0x6, 3).then(v => {check_test(v, false);})
  await test_auction(config, 0x6, 2).then(v => {check_test(v, false);})
  await test_auction(config, 0x7, 2).then(v => {check_test(v, true);})
*/
}
tests(process.argv[2]).then(v => {process.exit();});
