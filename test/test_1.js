const NFT = artifacts.require("nft");

contract("Testing NFT Mint", async (accounts) => {
  let instance;

  before('setup contract', async() => {
    // Initialize Config
    instance = await NFT.deployed();

    // Monitor Events
    instance.Tester({}, (error, result) => {
      if(error) console.error(error);
      console.log(`[TESTER] => [message] : ${result.args.message} [status] : ${result.args.status}`);
    });
  })

  console.log("testing ...");

  it("Should Register Oracles Successfully", async () => {
    await instance.test_mint(0x2f)
  })
})
