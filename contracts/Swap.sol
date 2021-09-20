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
    uint256 amount0 = witness[cursor+3];
    uint256 amount1 = witness[cursor+4];
    uint256 balance0 = witness[cursor+5];
    uint256 balance1 = witness[cursor+6];
    /* We need to put snark verification here */
    /* set u_1 */

    uint256[] memory ops = new uint256[](13);
    ops[0] = _SET_POOL;
    ops[1] = tokenId0;
    ops[2] = tokenId1;
    ops[3] = amount0;
    ops[4] = amount1;
    ops[5] = _SET_BALANCE;
    ops[6] = tokenId0;
    ops[7] = l2account;
    ops[8] = balance0;
    ops[9] = _SET_BALANCE;
    ops[10] = tokenId1;
    ops[11] = l2account;
    ops[12] = balance1;
    return ops;
  }
  function getVerifierInfo() public override pure returns (VerifierInfo memory) {
    return VerifierInfo(7);
  }
  function testArgument(uint cursor, uint256[] calldata witness) public pure returns (uint256) {
    return witness[cursor];
  }
}
