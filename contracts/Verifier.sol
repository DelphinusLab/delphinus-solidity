// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface Verifier {
    /**
     * @dev snark verification stub
     */
    function verifyTx(uint256[] calldata args) external returns (bool);
}
