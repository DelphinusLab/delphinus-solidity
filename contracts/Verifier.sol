// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface DelphinusVerifier {
    /**
     * @dev snark verification stub
     */
    function verifyDelphinusTx(uint256[] calldata args) external returns (bool);
}
