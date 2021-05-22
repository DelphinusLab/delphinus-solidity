const Config = require("../config")
const TokenInfo = require("../../build/contracts/Token.json")
const NFTInfo = require("../../build/contracts/NFT.json");
const BiddingInfo = require("../../build/contracts/Bidding.json");
const Client = require("web3subscriber/client");
const nft = require("./nft");


async function test_mint(id) {
  let web3 = await Client.initWeb3(Config, false);
  let account = Config.monitor_account;
  let nft_client = new nft.NftClient(web3, Config, TokenInfo, NFTInfo, BiddingInfo, account);
  try {
    let mint_tx = await nft_client.mint(id);
    //console.log(mint_tx);
    return true;
   } catch (error) {
    let msg = error.message.split(':')
    console.log(msg[msg.length - 1]);
    return false;
   }
}
function check_mint(result, indicator) {
  if(result == indicator) {
    console.log("test correct");
  } else {
    console.log("test error");
  }
}


async function mint20() { 
    await test_mint(0x514).then(v => {console.log(v);check_mint(v,true)});
    await test_mint(0x514).then(v => {console.log(v);check_mint(v,false)});
    await test_mint(0x102).then(v => {check_mint(v,true)});
    await test_mint(0x102).then((v => {check_mint(v,false)});
    await test_mint(0x103).then(v => {check_mint(v,true)});
    await test_mint(0x103).then(v => {check_mint(v,false)});
    await test_mint(0x3).then(v => {check_mint(v,true)});
    await test_mint(0x3).then((v => {check_mint(v,false)});
    await test_mint(0x4).then(v => {check_mint(v,true)});
    await test_mint(0x4).then((v => {check_mint(v,false)});
    await test_mint(0x5).then(v => {check_mint(v,true)});
    await test_mint(0x5).then((v => {check_mint(v,false)});
    await test_mint(0x6).then(v => {check_mint(v,true)});
    await test_mint(0x6).then((v => {check_mint(v,false)});
    await test_mint(0x7).then(v => {check_mint(v,true)});
    await test_mint(0x7).then((v => {check_mint(v,false)});
    await test_mint(0x8).then(v => {check_mint(v,true)});
    await test_mint(0x8).then((v => {check_mint(v,false)});
    await test_mint(0x9).then(v => {check_mint(v,true)});
    await test_mint(0x9).then((v => {check_mint(v,false)});
    await test_mint(0xa).then(v => {check_mint(v,true)});
    await test_mint(0xa).then((v => {check_mint(v,false)});
}
  mint20().then(v => {process.exit();});
