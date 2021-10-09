// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./Verifier.sol";
contract DummyVerifier is DelphinusVerifier {
  function verifyDelphinusTx(uint256[] calldata)
    public pure override returns (bool) {
    return true;
  }
}
