// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./Verifier.sol";
contract Withdraw is Verifier{

  uint8 constant _WITHDRAW = 0x1;

  function verify(uint256[] calldata args, uint cursor) public override returns (uint256[] memory) {
    uint256[] memory witness = new uint256[](5);
    uint i = 0;
    witness[0] = uint256(_WITHDRAW);
    for (; i!=5; i++) {
      witness[i+1] = args[cursor+i];
    }
    return witness;
  }
  function nbArgs() public override pure returns (uint) {
    return 5;
  }
}
