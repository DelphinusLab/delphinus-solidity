// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./Transaction.sol";
contract Withdraw is Transaction {

  function sideEffect(uint256[] calldata witness, uint cursor) public pure override returns (uint256[] memory) {
    uint256[] memory ops = new uint256[](4);
    // uint256 l2account = witness[cursor];
    uint256 tokenIdx = witness[cursor + 2];
    uint256 transferAmount = witness[cursor + 3];
    uint256 l1recipent = witness[cursor + 4];
    /* We need to put snark verification here */
    ops[0] = _WITHDRAW;
    ops[1] = tokenIdx;
    ops[2] = transferAmount;
    ops[3] = l1recipent;
    return ops;
  }
}
