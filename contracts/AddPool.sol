// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./Transaction.sol";
contract AddPool is Transaction{

  function sideEffect(uint256[] calldata, uint) public pure override
    returns (uint256[] memory) {
    return new uint256[](0);
  }
}