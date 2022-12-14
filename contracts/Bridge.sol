// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Verifier.sol";
import "./Transaction.sol";
import "./DelphinusBridge.sol";
import "./MKT.sol";
import "./TransferHelper.sol";

contract Bridge is DelphinusBridge {
    event Deposit(uint256 l1token, uint256 l2account, uint256 amount);
    event WithDraw(uint256 l1account, uint256 l2account, uint256 amount);
    event SwapAck(uint256 rid, uint256 l2account);

    TokenInfo[] private _tokens;
    Transaction[] private transactions;
    DelphinusVerifier[] private verifiers;
    BridgeInfo _bridge_info;

    mapping(uint256 => bool) private _tmap;
    address private _owner;

    mapping(uint256 => bool) private hasSideEffiect;
    uint256 merkle_root;
    uint256 rid;
    uint256 verifierID;

    constructor(uint32 chain_id) {
        _bridge_info.chain_id = chain_id;
        _bridge_info.owner = msg.sender;
        merkle_root = 0x151399c724e17408a7a43cdadba2fc000da9339c56e4d49c6cdee6c4356fbc68;
        rid = 0;
    }

    /* Make sure token index is sain and return token uid */
    function get_token_uid(uint128 tidx) private view returns (uint256) {
        require(tidx < _bridge_info.amount_token, "OutOfBound: Token Index");
        return _tokens[tidx].token_uid;
    }

    function ensure_admin() private view {
        require(_bridge_info.owner == msg.sender, "Authority: Require Admin");
    }

    function getBridgeInfo() public view returns (BridgeInfo memory) {
        return
            BridgeInfo(
                _bridge_info.chain_id,
                _bridge_info.amount_token,
                _bridge_info.amount_pool,
                _bridge_info.owner,
                merkle_root,
                rid,
                verifierID
            );
    }

    function addToken(uint256 token) public returns (uint32) {
        //ensure_admin();
        uint32 cursor = uint32(_tokens.length);
        _tokens.push(TokenInfo(token));
        _bridge_info.amount_token = cursor + 1;
        require(_tmap[token] == false, "AddToken: Token Already Exist");
        if (token != 0) {
            _tmap[token] = true;
        }
        return cursor;
    }

    function allTokens() public view returns (TokenInfo[] memory) {
        return _tokens;
    }

    function _withdraw(
        uint128 tidx,
        uint128 amount,
        uint256 l1recipent
    ) public {
        uint256 tokenid = get_token_uid(tidx);
        if (_is_local(tokenid) && _is_local(l1recipent)) {
            address token = address(uint160(tokenid));
            address recipent = address(uint160(l1recipent));

            // Sanitity checks
            require(recipent != address(0), "Withdraw to the zero address");

            // transfer amount back to recipent
            IERC20 underlying_token = IERC20(token);
            //underlying_token.transfer(recipent, amount);
            TransferHelper.safeTransfer(address(underlying_token), recipent, amount);
        }
    }

    function addTransaction(address txaddr, bool sideEffect) public returns (uint256) {
        ensure_admin();
        uint256 cursor = transactions.length;
        require(transactions.length < 255, "TX index out of bound");
        transactions.push(Transaction(txaddr));
        if (sideEffect) {
          hasSideEffiect[cursor] = sideEffect;
        }
        return cursor;
    }

    function addVerifier(address vaddr) public returns (uint256) {
        ensure_admin();
        uint256 cursor = verifiers.length;
        verifierID = verifiers.length;
        require(verifiers.length < 255, "Verifier index out of bound");
        verifiers.push(DelphinusVerifier(vaddr));
        return cursor;
    }

    function _get_transaction(uint8 tid) private view returns (Transaction) {
        require(transactions.length > tid, "TX index out of bound");
        return transactions[tid];
    }

    function _get_verifier(uint8 vid) private view returns (DelphinusVerifier) {
        require(verifiers.length > vid, "Verifier index out of bound");
        return verifiers[vid];
    }

    /* encode the l1 address into token_uid */
    function _l1_address(address account) private view returns (uint256) {
        return
            (uint256(uint160(account))) +
            (uint256(_bridge_info.chain_id) << 160);
    }

    function _is_local(uint256 l1address) private view returns (bool) {
        return ((l1address >> 160) == (uint256(_bridge_info.chain_id)));
    }

    function deposit(
        address token,
        uint256 amount,
        uint256 l2account
    ) public {
        IERC20 underlying_token = IERC20(token);
        uint256 token_uid = _l1_address(token);
        require(_tmap[token_uid] == true, "Deposit: Untracked Token");
        uint256 balance = underlying_token.balanceOf(msg.sender);
        require(balance >= amount, "Insufficient Balance");
        //underlying_token.transferFrom(msg.sender, address(this), amount); //USDT does not follow ERC20 interface so have to use other method
        TransferHelper.safeTransferFrom(address(underlying_token), msg.sender, address(this), amount);
        emit Deposit(_l1_address(token), l2account, amount);
    }

    /*
     * @dev side effect encoded in the update function
     * deltas = [| opcode; args |]
     */
    function _update_state(uint256[] memory deltas) private {
        uint256 cursor = 0;
        while (cursor < deltas.length) {
            uint256 delta_code = deltas[cursor];
            if (delta_code == _WITHDRAW) {
                require(
                    deltas.length >= cursor + 4,
                    "Withdraw: Insufficient arg number"
                );
                _withdraw(
                    uint128(deltas[cursor + 1]),
                    uint128(deltas[cursor + 2]),
                    deltas[cursor + 3]
                );
                cursor = cursor + 4;
            } else {
                revert("SideEffect: UnknownSideEffectCode");
            }
        }
    }

    uint256 constant BATCH_SIZE = 10;
    uint256 constant OP_SIZE = 81;

    /*
     * @dev Data encodes the delta functions with there verification in reverse order
     * data = opcode args; opcode' args'; ....
     */
    function verify(
        bytes calldata tx_data,
        uint256[] calldata verify_data, // [8]: old root, [9]: new root, [10]: sha_low, [11]: sha_high
        uint8 _vid,
        uint256 _rid
    ) public {
        require(rid == _rid, "Verify: Unexpected Request Id");

        require(
            tx_data.length == OP_SIZE * BATCH_SIZE,
            "Verify: Insufficient delta operations"
        );

        uint256 sha_pack = uint256(sha256(tx_data));
        require(
            sha_pack == (verify_data[8] << 128) + verify_data[9],
            "Inconstant: Sha data inconsistant"
        );

        require(
            merkle_root == verify_data[10],
            "Inconstant: Merkle root dismatch"
        );

        DelphinusVerifier verifier = _get_verifier(_vid);
        bool v = verifier.verifyDelphinusTx(verify_data);
        require(v == true, "ZKVerify: zksnark check failed");

        for (uint i = 0; i < BATCH_SIZE; i++) {
            uint8 op_code = uint8(tx_data[i * OP_SIZE]);
            require(transactions.length > op_code, "TX index out of bound");
            if (hasSideEffiect[op_code]) {
                Transaction transaction = _get_transaction(op_code);
                uint256[] memory update = transaction.sideEffect(tx_data, i * OP_SIZE + 1);
                _update_state(update);
            }
        }

        uint256 new_merkle_root = verify_data[11];
        merkle_root = new_merkle_root;
        rid = _rid + BATCH_SIZE;

        emit SwapAck(_rid, 0);
    }
}
