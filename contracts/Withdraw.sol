// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./Verifier.sol";
contract Withdraw is Verifier{

  uint8 constant _SET_BALANCE = 0x1;
  uint8 constant _SET_POOL = 0x2;
  uint8 constant _WITHDRAW = 0x3;

  function verify(uint256[] calldata witness, uint cursor) public override returns (uint256[] memory) {
    uint256[] memory ops = new uint256[](8);
    uint256 l2account = witness[cursor];
    uint256 tokenId = witness[cursor+1];
    uint256 restAmount = witness[cursor+2];
    uint256 l1recipent = witness[cursor+3];
    uint256 transferAmount = witness[cursor+4];
    /* We need to put snark verification here */
    /* set u_1 */
    ops[0] = _SET_BALANCE;
    ops[1] = tokenId;
    ops[2] = l2account;
    ops[3] = restAmount;
    /* set u_3 */
    ops[4] = _WITHDRAW;
    ops[5] = tokenId;
    ops[6] = transferAmount;
    ops[7] = l1recipent;
    return ops;
  }
  function getVerifierInfo() public override pure returns (VerifierInfo memory) {
    return VerifierInfo(5);
  }
}
