// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// SideEffects
uint8 constant _WITHDRAW = 0x1;

struct VerifierInfo {
  uint nbArgs;
}

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */

interface Verifier {
    /**
     * @dev snark verification stub
     */
    function verify(uint256[] calldata args, uint cursor) external returns (uint256[] memory, uint256 merkle_root);
    function getVerifierInfo() external pure returns (VerifierInfo memory);
}
