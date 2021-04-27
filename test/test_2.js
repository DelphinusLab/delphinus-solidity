const Bridge = artifacts.require("bridge");
const TOKEN = artifacts.require("token");
contract("Testing Bridge", async (accounts) => {
  let bidding;
  let nft;

  before('setup contract', async() => {
    // Initialize Config
    token = await TOKEN.deployed();
    bridge = await Bridge.deployed();
  })

  console.log("testing ...");

  it("Should Register Oracles Successfully", async () => {
    await token.mint("0x200");

    let address = await bridge.getAddress();
    let l2account = "0x7a50c8fa50a39bd48dfd8053ebff44ba3da45dd8c3e90a5fec9fd73a4595251b";
    console.log("account address is:", address);

    let contract_address = bridge.address;
    console.log("bridge address is:", contract_address);


    let account_balance = await token.getBalance();
    console.log("account balance:", account_balance);
    await token.approve(contract_address, 0x20);
    await bridge.deposit(token.address, 0x20, l2account);

  })
})

