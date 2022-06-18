// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./MKT.sol";


interface DelphinusBridge {
    /**
     * @dev snark verification stub
     */
    function getBridgeInfo() external view returns (BridgeInfo memory);
    function addToken(uint256 token) external returns (uint32);
    function allTokens() external view returns (TokenInfo[] memory);

    function addTransaction(address txaddr, bool sideEffect) external returns (uint256);
    function addVerifier(address vaddr) external returns (uint256);
    function deposit(
        address token,
        uint256 amount,
        uint256 l2account
    ) external; 

    function verify(
        bytes calldata tx_data,
        uint256[] calldata verify_data, // [8]: old root, [9]: new root, [10]: sha_low, [11]: sha_high
        uint8 _vid,
        uint256 _rid
    ) external;
}
