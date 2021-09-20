// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./Verifier.sol";
contract Supply is Verifier{

  function verify(uint256[] calldata witness, uint cursor) public pure override
    returns (uint256[] memory) {
    require (witness.length >= cursor + 8, "Pool Op Error");
    uint256 l2account = witness[cursor];
    uint256 poolidx = witness[cursor+1];
    uint256 amount0 = witness[cursor+2];
    uint256 amount1 = witness[cursor+3];
    /* We need to put snark verification here */
    /* set u_1 */

    uint256[] memory ops = new uint256[](0);
    return (ops, 0);
  }
  function getVerifierInfo() public override pure returns (VerifierInfo memory) {
    return VerifierInfo(4);
  }
  function testArgument(uint cursor, uint256[] calldata witness) public pure returns (uint256) {
    return witness[cursor];
  }
}
