// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// SideEffects
uint8 constant _WITHDRAW = 0x1;

interface Transaction {
    /**
     * @dev snark verification stub
     */
    function sideEffect(bytes calldata args, uint cursor) external pure returns (uint256[] memory);
}
