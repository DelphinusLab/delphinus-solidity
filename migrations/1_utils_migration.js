const Bridge = artifacts.require("Bridge");
const Withdraw = artifacts.require("Withdraw");
const Deposit = artifacts.require("Deposit");
const Supply = artifacts.require("Supply");
const Swap = artifacts.require("Swap");
const Retrive = artifacts.require("Retrive");
const AddPool = artifacts.require("AddPool");
const SetKey = artifacts.require("SetKey");
const DummyVerifier = artifacts.require("DummyVerifier");
const ZKPVerifier = artifacts.require("GrothVerifier");

module.exports = async function (deployer) {
  id = await web3.eth.net.getId();
  console.log("netid", id);

  await Promise.all([
    deployer.deploy(Deposit),
    deployer.deploy(Withdraw),
    deployer.deploy(Swap),
    deployer.deploy(Retrive),
    deployer.deploy(Supply),
    deployer.deploy(AddPool),
    deployer.deploy(SetKey),
  ]);

  //tx = await bridge.addVerifier(dmverifier.address);
};
