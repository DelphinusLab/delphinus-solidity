// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./Transaction.sol";
contract Deposit is Transaction {

  function sideEffect(uint256[] calldata, uint) public pure override
    returns (uint256[] memory) {
    uint256[] memory r = new uint256[](0);
    return r;
  }
}
