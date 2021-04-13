const Web3 = require("web3")
const FileSys = require("fs")
let web3 = new Web3("ws://localhost:8546");
let account = "0x63A92641421284FEa4A44E955F5254e7cCa890a8";
let nft_data = FileSys.readFileSync("build/contracts/NFT.json");
let nft_abi = JSON.parse(nft_data).abi;
let nft_address = "0x13D406F296fFe85424EdA734e935245d28494B5D";
let nft_contract = new web3.eth.Contract(nft_abi, nft_address, {from:"0x63A92641421284FEa4A44E955F5254e7cCa890a8"});
nft_contract.methods.symbol().call()

