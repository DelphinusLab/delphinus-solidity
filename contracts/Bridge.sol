// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Verifier.sol";
import "./Transaction.sol";
import "./MKT.sol";
contract Bridge {

  event Deposit(uint256 l1token, uint256 l2account, uint256 amount, uint256 nonce);
  event WithDraw(uint256 l1account, uint256 l2account, uint256 amount, uint256 nonce);
  event SwapAck(uint256 l2account, uint256 rid);

  BridgeInfo _bridge_info;

  Transaction[] private transactions;
  DelphinusVerifier[] private verifiers;

  TokenInfo[] private _tokens;
  mapping (uint256 => bool) private _tmap;

  address private _owner;

  mapping (uint256 => uint256) private _nonce;


  constructor(uint32 chain_id) {
    _bridge_info.chain_id = chain_id;
    _bridge_info.owner = msg.sender;
    _bridge_info.merkle_root = 0x151399c724e17408a7a43cdadba2fc000da9339c56e4d49c6cdee6c4356fbc68;
  }

  /* Make sure token index is sain */
  function token_index_check(uint128 tidx) private view {
    require(tidx < _bridge_info.amount_token, "OutOfBound: Token Index");
  }

  /* Make sure token index is sain and return token uid */
  function get_token_uid(uint128 tidx) private view returns (uint256){
    token_index_check(tidx);
    return _tokens[tidx].token_uid;
  }

  function ensure_admin() private view {
    require(_bridge_info.owner == msg.sender, "Authority: Require Admin");
  }

  function getBridgeInfo() public view returns (BridgeInfo memory) {
    return _bridge_info;
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

  function getToken(uint128 tidx) public view returns (TokenInfo memory) {
    token_index_check(tidx);
    return _tokens[tidx];
  }

  function allTokens() public view returns (TokenInfo[] memory) {
    return _tokens;
  }

  function _withdraw(uint128 tidx, uint128 amount, uint256 l1recipent) public {
    uint256 tokenid = get_token_uid(tidx);
    if (_is_local(tokenid) && _is_local(l1recipent)) {
      address token = address(uint160(tokenid));
      address recipent = address(uint160(l1recipent));

      // Sanitity checks
      require(recipent!= address(0), "Withdraw to the zero address");

      // transfer amount back to recipent
      IERC20 underlying_token = IERC20(token);
      underlying_token.transfer(recipent, amount);
    }
  }

  function addTransaction(address txaddr) public returns (uint) {
    ensure_admin();
    uint cursor = transactions.length;
    transactions.push(Transaction(txaddr));
    return cursor;
  }

  function addVerifier(address vaddr) public returns (uint) {
    ensure_admin();
    uint cursor = verifiers.length;
    verifiers.push(DelphinusVerifier(vaddr));
    return cursor;
  }


  function _get_transaction(uint256 call_info) private view returns(Transaction) {
    bytes memory info = abi.encodePacked(call_info);
    require(transactions.length > uint8(info[31]), "Call Info index out of bound");
    return transactions[uint8(info[31])];
  }

  function _get_verifier(uint256 call_info) private view returns(DelphinusVerifier) {
    bytes memory info = abi.encodePacked(call_info);
    require(verifiers.length > uint8(info[31]), "Call Info index out of bound");
    return verifiers[uint8(info[31])];
  }

  /* encode the l1 address into token_uid */
  function _l1_address(address account) private view returns (uint256) {
    return (uint256(uint160(account))) + (uint256(_bridge_info.chain_id) << 160);
  }

  function _is_local(uint256 l1address) private view returns (bool) {
    return ((l1address >> 160) == (uint256(_bridge_info.chain_id)));
  }

  function _get_delta_code(uint256 call_info) private pure returns(uint8) {
    bytes memory info = abi.encodePacked(call_info);
    return uint8(info[0]);
  }


  function deposit(address token, uint256 amount, uint256 l2account) public {
    IERC20 underlying_token = IERC20(token);
    uint256 token_uid = _l1_address(token);
    require(_tmap[token_uid] == true, "Deposit: Untracked Token");
    uint256 balance = underlying_token.balanceOf(msg.sender);
    require(balance >= amount, "Insuffecient Balance");
    underlying_token.transferFrom(msg.sender, address(this), amount);
    _nonce[l2account] += 1;
    emit Deposit(_l1_address(token), l2account, amount , _nonce[l2account]);
  }

  function nonceOf(uint256 l2account) public view returns(uint256) {
    return _nonce[l2account];
  }

  /*
   * @dev side effect encoded in the update function
   * deltas = [| opcode; args |]
   */
  function _update_state(uint256[] memory deltas) private {
    uint cursor = 0;
    while (cursor < deltas.length) {
      uint delta_code = deltas[cursor];
      if (delta_code == _WITHDRAW) {
        require(deltas.length >= cursor + 4, "Withdraw: Insufficient arg number");
        _withdraw(uint128(deltas[cursor+1]), uint128(deltas[cursor+2]), deltas[cursor+3]);
        cursor = cursor + 4;
      } else {
        revert("SideEffect: UnknownSideEffectCode");
      }
    }
  }

  /*
   * @dev Data encodes the delta functions with there verification in reverse order
   * data = opcode args; opcode' args'; ....
   */
  function verify(uint256 l2account,
      uint256[] memory tx_data,
      uint256[] memory verify_data, // [8]: old root, [9]: new root, [10]: sha_low, [11]: sha_high
      uint256 vid,
      uint256 nonce,
      uint256 rid
    ) public {
    //require(_nonce[l2account] == nonce, "Verify: Nonce does not match!");
    require (tx_data.length != 0, "Verify: Insufficient delta operations");
    require (_bridge_info.rid == rid-1, "Verify: Unexpected Request Id");
    _bridge_info.rid += 1;
    uint256 merkle_root = _bridge_info.merkle_root;
    uint256 sha_pack = uint256(sha256(abi.encodePacked(uint256(0), tx_data)));

    uint256 new_merkle_root = verify_data[11];
    require(merkle_root == verify_data[10], "Inconstant: Merkle root dismatch");
    require(sha_pack == (verify_data[8] << 128) + verify_data[9], "Inconstant: Sha data inconsistant");

    /* Perform zksnark check */
    DelphinusVerifier verifier = _get_verifier(vid);
    bool v = verifier.verifyDelphinusTx(verify_data);
    require(v == true, "ZKVerify: zksnark check failed");

    /* Perform transactions (withdraw ...) and update merkle root */
    uint cursor = 0;
    while (cursor < tx_data.length) {
      uint256 op_code = tx_data[cursor];
      cursor += 1;
      Transaction transaction = _get_transaction(op_code);
      uint256[] memory update = transaction.sideEffect(tx_data, cursor);
      _update_state(update);
      cursor += _TX_NUM_ARGS;
    }
    _bridge_info.merkle_root = new_merkle_root;
    emit SwapAck(l2account, rid);
  }

}
