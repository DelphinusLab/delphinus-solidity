// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// SideEffects
uint8 constant _WITHDRAW = 0x1;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */

uint8 constant _TX_NUM_ARGS = 0x8;

interface Transaction {
    /**
     * @dev snark verification stub
     */
    function sideEffect(uint256[] calldata args, uint cursor) external pure returns (uint256[] memory);
}
