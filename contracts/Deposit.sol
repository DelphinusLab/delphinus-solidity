// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./Verifier.sol";
contract Deposit is Verifier{

  function verify(uint256[] calldata witness, uint cursor) public override returns (uint256[] memory) {
    uint256[] memory ops = new uint256[](0);
    uint256 l2account = witness[cursor];
    uint256 tokenId = witness[cursor+1];
    uint256 restAmount = witness[cursor+2];
    uint256 transferAmount = witness[cursor+3];
    /* We need to put snark verification here */
    /* set u_1 */
    return (ops, 0);
  }
  function getVerifierInfo() public override pure returns (VerifierInfo memory) {
    return VerifierInfo(4);
  }
  function testArgument(uint cursor, uint256[] calldata witness) public pure returns (uint256) {
    return witness[cursor];
  }

}
