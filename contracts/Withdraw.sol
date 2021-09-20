// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./Verifier.sol";
contract Withdraw is Verifier{

  function verify(uint256[] calldata witness, uint cursor) public override returns (uint256[] memory) {
    uint256[] memory ops = new uint256[](4);
    uint256 l2account = witness[cursor];
    uint256 tokenIdx = witness[cursor+1];
    uint256 transferAmount = witness[cursor+2];
    uint256 l1recipent = witness[cursor+3];
    /* We need to put snark verification here */
    ops[4] = _WITHDRAW;
    ops[5] = tokenIdx;
    ops[6] = transferAmount;
    ops[7] = l1recipent;
    return (ops, 0);
  }
  function getVerifierInfo() public override pure returns (VerifierInfo memory) {
    return VerifierInfo(5);
  }
}
