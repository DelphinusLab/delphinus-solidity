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
    await nft_client.mint(id);
    let owner = await nft_client.getOwner(id);
    console.log(owner);
    return true;
   } catch (error) {
      let msg = error.message.split(':')
      console.log(msg[msg.length - 1]);
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
  await test_owner(0x3).then(v => {check_owner(v, true)});
  await test_owner(0x4).then(v => {check_owner(v, true)});
  await test_owner(0x5).then(v => {check_owner(v, true)});
  await test_owner(0x6).then(v => {check_owner(v, true)});
  await test_owner(0x7).then(v => {check_owner(v, true)});
  await test_owner(0x8).then(v => {check_owner(v, true)});
  await test_owner(0x9).then(v => {check_owner(v, true)});
  await test_owner(0x10).then(v => {check_owner(v, true)});
  await test_owner(0x11).then(v => {check_owner(v, true)});
  await test_owner(0x12).then(v => {check_owner(v, true)});
  await test_owner(0x13).then(v => {check_owner(v, true)});
  await test_owner(0x14).then(v => {check_owner(v, true)});
  await test_owner(0x15).then(v => {check_owner(v, true)});
  await test_owner(0x16).then(v => {check_owner(v, true)});
  await test_owner(0x17).then(v => {check_owner(v, true)});
  await test_owner(0x18).then(v => {check_owner(v, true)});
  await test_owner(0x19).then(v => {check_owner(v, true)});
  await test_owner(0x20).then(v => {check_owner(v, true)});
  await test_owner(0x21).then(v => {check_owner(v, true)});
  await test_owner(0x22).then(v => {check_owner(v, true)});
}
  test().then(v => {process.exit();});
