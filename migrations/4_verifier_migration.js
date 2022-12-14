const Bridge = artifacts.require("Bridge");
const ZKPVerifier = artifacts.require("GrothVerifier");

module.exports = async function (deployer) {
  id = await web3.eth.net.getId();
  console.log("netid", id);

  await Promise.all([
    deployer.deploy(ZKPVerifier, id),
  ]);

  bridge = await Bridge.deployed();
  zkverifier = await ZKPVerifier.deployed()

  var tx = await bridge.addVerifier(zkverifier.address);
};