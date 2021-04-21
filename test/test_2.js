const Bridge = artifacts.require("bridge");
const TOKEN = artifacts.require("token");
contract("Testing NFT Mint", async (accounts) => {
  let bidding;
  let nft;

  before('setup contract', async() => {
    // Initialize Config
    token = await TOKEN.deployed();
    bridge = await Bridge.deployed();
  })

  console.log("testing ...");

  it("Should Register Oracles Successfully", async () => {
    let address = await bridge.getAddress();
    console.log("account address is:", address);
    let contract_address = bridge.address;
    console.log("address is:", contract_address);
    await token.mint(0x100);
    //await token.transfer(contract_address, 0x20);
    let account_balance = await token.getBalance();
    console.log("account balance:", account_balance);
    await token.approve(contract_address, 0x20);
    await bridge.deposit(0x20);
    let b = await token.balanceOf(contract_address);
    console.log("balance of contract", b);
    await bridge.withdraw(address, 0x10);
    b = await token.balanceOf(contract_address);
    console.log("balance of contract", b);
  })
})

