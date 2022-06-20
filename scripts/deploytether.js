// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const ethers = hre.ethers;
const BN = require("bn.js");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const TetherToken = await hre.ethers.getContractFactory("TetherToken");
  const Bridge = await hre.ethers.getContractFactory("FakeBridge");
  const token = await TetherToken.deploy(1000000000, "Tether", "USDT", 6);
  const bridge = await Bridge.deploy();

  await token.deployed();
  await bridge.deployed();

  const [acc1, acc2, acc3] = await ethers.getSigners();
  console.log(acc1.address, "first wallet address");

  console.log("token deployed to:", token.address);
  console.log("bridge deployed to:", bridge.address);

  let acc1Balance = await token.balanceOf(acc1.address);
  console.log(acc1Balance, "token balance before transfer");
  let acc2Balance = await token.balanceOf(acc2.address);
  console.log(acc2Balance, "token balance before transfer");

  await token.approve(acc2.address, ethers.constants.MaxUint256);
  //check allowances
  let allowance1 = await token.allowance(acc1.address, acc2.address); //from to
  console.log(allowance1, "allowance1 ");
  let allowance2 = await token.allowance(acc2.address, acc3.address);
  console.log(allowance2, "allowance2");

  //Testing normal transferFrom function
  try {
    await token.connect(acc2).transferFrom(acc1.address, acc2.address, 100);
  } catch (e) {
    console.log(e);
  }

  acc1Balance = await token.balanceOf(acc1.address);

  acc2Balance = await token.balanceOf(acc2.address);

  //Test bridge contract deposit
  await token.approve(bridge.address, ethers.constants.MaxUint256);
  let bridgeAllowance = await token.allowance(acc1.address, bridge.address);
  console.log(bridgeAllowance, "FakeBridge allowance");
  console.log("Attempting to deposit 100 tokens...");
  await bridge.deposit(token.address, 100);

  let bridgeBalance = await token.balanceOf(bridge.address);
  console.log(bridgeBalance, "FakeBridge balance");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
