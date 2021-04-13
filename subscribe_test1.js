const Web3 = require("web3")
const FileSys = require("fs")
let web3 = new Web3("ws://localhost:8546");
let account = "0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b";
let nft_data = FileSys.readFileSync("build/contracts/CHECK.json");
let nft_abi = JSON.parse(nft_data).abi;
let nft_address = "0x3E65f4e46d3dE8568B9a18BCe0eDc9Ac87CdC774";
console.log("check nft address!");
//web3.eth.defaultAccount = "
web3.eth.getCode(nft_address).then(async (x) => {
    console.log(x);
    let nft_contract = new web3.eth.Contract(nft_abi, nft_address, {from:account});
    console.log("start calling");
    console.log(nft_contract.events.Tester);
    let r = await nft_contract.methods.test_mint(0x36).call();
    r = await nft_contract.methods.test_mint(0x36).call();
    //r = nft_contract.getPastEvents("Tester", {
    //    fromBlock:0, toBlock:"latest"
    console.log(nft_contract.events);
    r = nft_contract.events.allEvents({
        }, (error, result) => {
        console.log("get event");
        console.log(error);
        console.log(result);
    });
//    r = await nft_contract.methods.test_mint(0x36).call();
//    name = await nft_contract.methods.get_name().send();
//    console.log("initial name:" + name);
/*
    r = await nft_contract.methods.change_name("testname").send();
    console.log("reset name:" + r);
    nname = await nft_contract.methods.get_name().call();
    console.log("get name:" + nname);
*/
  }
);


