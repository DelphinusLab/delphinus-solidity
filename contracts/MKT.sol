// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

struct PoolInfo {
    uint128 tidx0;
    uint128 tidx1;
    uint128 l0;
    uint128 l1;
}

struct TokenInfo {
    uint256 token_uid;
}

struct BridgeInfo {
    uint128 chain_id;
    uint32 amount_token;
    uint32 amount_pool;
    address owner;
    uint256 merkle_root;
    uint256 rid;
    uint256 verifierID;
}
