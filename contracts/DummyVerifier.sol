// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./Verifier.sol";
contract DummyVerifier is Verifier {

  function verifyTx(uint256[] calldata)
    public pure override returns (bool) {
    return true;
  }
}
