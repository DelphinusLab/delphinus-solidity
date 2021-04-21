const Web3 = require("web3")
const FileSys = require("fs")
let web3 = new Web3("ws://localhost:8546");
let account = "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b";
let nft_data = FileSys.readFileSync("build/contracts/NFT.json");
let nft_abi = JSON.parse(nft_data).abi;
//let nft_address = "0x3E65f4e46d3dE8568B9a18BCe0eDc9Ac87CdC774";
let nft_address = "0x3FF42fb199E8FC6C88Abe85ed5C28323aa26Bcf7";
console.log("check nft address!");
web3.eth.getCode(nft_address).then(async (x) => {
    let nft_contract = new web3.eth.Contract(nft_abi, nft_address, {from:account});
    console.log("start calling");
    try {
      let r = await nft_contract.methods.mint(0x4c).send();
    } catch (err) {
      console.log("%s", err);
    }
  }
);


