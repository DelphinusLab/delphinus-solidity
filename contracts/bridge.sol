// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Verifier.sol";
import "./MKT.sol";
contract Bridge {

  event Deposit(uint256 l1token, uint256 l2account, uint256 amount, uint256 nonce);
  event WithDraw(uint256 l1account, uint256 l2account, uint256 amount, uint256 nonce);
  event SwapAck(uint256 l2account, uint256 rid);

  BridgeInfo _bridge_info;

  Verifier[] private verifiers;

  TokenInfo[] private _tokens;

  address private _owner;

  mapping (uint256 => uint256) private _nonce;


  constructor(uint32 chain_id) {
    _bridge_info.chain_id = chain_id;
    _bridge_info.owner = msg.sender;
  }

  /* Make sure token index is sain */
  function token_index_check(uint128 tidx) private {
    require(tidx < _bridge_info.amount_token, "OutOfBound: Token Index");
  }

  /* Make sure token index is sain and return token uid */
  function get_token_uid(uint128 tidx) private {
    token_index_check(tidx);
    return _tokens[tidx].token_uid;
  }

  function ensure_admin() private {
    require(_bridge_info.owner == msg.sender, "Authority: Require Admin");
  }

  function getBridgeInfo() public view returns (BridgeInfo memory) {
    return _bridge_info;
  }

  function addToken(uint256 token) private returns (uint128) {
    ensure_admin();
    uint cursor = _tokens.length;
    _tokens.push[TokenInfo(token)];
    _bridge_info.amount_token = cursor;
    return cursor;
  }

  function getToken(uint128 tidx) public view returns (TokenInfo memory) {
    token_index_check(tidx);
    return _tokens[tidx];
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

  function add_verifier(address verifier) public returns (uint) {
    uint cursor = verifiers.length;
    verifiers.push(Verifier(verifier));
    return cursor;
  }

  function _get_verifier(uint256 call_info) private view returns(Verifier) {
    bytes memory info = abi.encodePacked(call_info);
    require(verifiers.length > uint8(info[0]), "Call Info index out of bound");
    return verifiers[uint8(info[0])];
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
    uint256 balance = underlying_token.balanceOf(msg.sender);
    require(balance >= amount, "Insuffecient Balance");
    underlying_token.transferFrom(msg.sender, address(this), amount);
    /*
     * done via l2 broadcast
     * uint256 token_id = _l1_address(token);
     * _balances[token_id][l2account] += amount;
     */
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
        _withdraw(deltas[cursor+1], deltas[cursor+2], deltas[cursor+3]);
        cursor = cursor + 4;
      } else {
        require(1==2, "SideEffect: UnknownSideEffectCode");
      }
    }
  }

  /*
   * @dev Data encodes the delta functions with there verification in reverse order
   * data = opcode args; opcode' args'; ....
   */
  function verify(uint256 l2account, uint256[] memory data,
    uint256 nonce, uint256 rid) public {
    //require(_nonce[l2account] == nonce, "Verify: Nonce does not match!");
    require (data.length != 0, "Verify: Insufficient delta operations");
    uint cursor = 0;
    uint256 merkle_root = _bridge_info.merkle_root;
    while (cursor < data.length) {
      uint256 op_code = data[cursor];
      cursor += 1;
      Verifier verifier = _get_verifier(op_code);
      (uint256[] memory update, uint256 mr) = verifier.verify(data, cursor);
      merkle_root = mr;
      _update_state(update);
      cursor += verifier.getVerifierInfo().nbArgs;
    }
    _bridge_info.merkle_root = merkle_root;
    emit SwapAck(l2account, rid);
  }

  function getVerifierInfo(uint index) public view returns (VerifierInfo memory) {
    Verifier verifier = verifiers[index];
    return verifier.getVerifierInfo();
  }

}
