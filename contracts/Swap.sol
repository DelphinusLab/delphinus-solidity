// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./Verifier.sol";
contract Swap is Verifier{

  function verify(uint256[] calldata witness, uint cursor) public pure override
    returns (uint256[] memory) {
    require (witness.length >= cursor + 7, "Pool Op Error");
    uint256 l2account = witness[cursor];
    uint256 tokenId0 = witness[cursor+1];
    uint256 tokenId1 = witness[cursor+2];
    uint256 amount = witness[cursor+3];

    return ([], 0);
  }
  function getVerifierInfo() public override pure returns (VerifierInfo memory) {
    return VerifierInfo(8);
  }
  function testArgument(uint cursor, uint256[] calldata witness) public pure returns (uint256) {
    return witness[cursor];
  }
}
