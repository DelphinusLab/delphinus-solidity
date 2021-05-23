// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

struct VerifierInfo{
  uint nbArgs;
}

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */

interface Verifier {
    /**
     * @dev snark verification stub
     */
    function verify(uint256[] calldata args, uint cursor) external returns (uint256[] memory);
    function getVerifierInfo() external pure returns (VerifierInfo memory);
}