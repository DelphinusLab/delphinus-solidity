const Config = require("../config")
const TokenInfo = require("../../build/contracts/Token.json")
const NFTInfo = require("../../build/contracts/NFT.json");
const BiddingInfo = require("../../build/contracts/Bidding.json");
const Client = require("web3subscriber/client");
const nft = require("./nft");


async function test_owner(id) {
  let web3 = await Client.initWeb3(Config, false);
  let account = Config.monitor_account;
  let nft_client = new nft.NftClient(web3, Config, TokenInfo, NFTInfo, BiddingInfo, account);
  try {
    let owner = await nft_client.getOwner(id);
    console.log(owner);
    return true;
   } catch (error) {
      let msg = error.message.split(':')
      console.log(msg[msg.length - 1]);
      if(msg[msg.length-1].indexOf("minted") != -1) {
        console.log("please mint at first!");
      }
      await nft_client.mint(id);
      return false;
   }
}
function check_owner(result, indicator) {
  if(result == indicator){
    console.log("test correct!");
  } else {
    console.log("test error!");
  }
}
async function test() {
  await test_owner(0x161).then(v => {check_owner(v, false)});
  await test_owner(0x161).then(v => {check_owner(v, true)});
  await test_owner(0x171).then(v => {check_owner(v, false)});
  await test_owner(0x171).then(v => {check_owner(v, true)});
  await test_owner(0x181).then(v => {check_owner(v, false)});
  await test_owner(0x181).then(v => {check_owner(v, true)});
  await test_owner(0x191).then(v => {check_owner(v, false)});
  await test_owner(0x191).then(v => {check_owner(v, true)});
  await test_owner(0x201).then(v => {check_owner(v, false)});
  await test_owner(0x201).then(v => {check_owner(v, true)});
  await test_owner(0x221).then(v => {check_owner(v, false)});
  await test_owner(0x221).then(v => {check_owner(v, true)});
  await test_owner(0x241).then(v => {check_owner(v, false)});
  await test_owner(0x241).then(v => {check_owner(v, true)});
  await test_owner(0x251).then(v => {check_owner(v, false)});
  await test_owner(0x251).then(v => {check_owner(v, true)});
  await test_owner(0x261).then(v => {check_owner(v, false)});
  await test_owner(0x261).then(v => {check_owner(v, true)});
  await test_owner(0x271).then(v => {check_owner(v, false)});
  await test_owner(0x271).then(v => {check_owner(v, true)});
}
  test().then(v => {process.exit();});
