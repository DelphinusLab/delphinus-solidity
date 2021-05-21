// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Verifier.sol";
contract Bridge {

  event Deposit(uint256 l1token, uint256 l2account, uint256 amount, uint256 nonce);
  event WithDraw(uint256 l1account, uint256 l2account, uint256 amount, uint256 nonce);
  event SwapAck(uint256 l2account, uint256 rid);

  Verifier[] private verifiers;

  struct PoolInfo {
    uint256 l1token0;
    uint256 l0;
    uint256 l1token1;
    uint256 l1;
  }

  PoolInfo[] private _pools;

  address private owner;
  uint8 private _cid;

  uint8 constant _SET_BALANCE = 0x1;
  uint8 constant _SET_POOL = 0x2;
  uint8 constant _WITHDRAW = 0x3;

  mapping (uint256 => mapping(uint256 => uint256)) private _balances;
  mapping (uint256 => uint256) private _nonce;


  constructor(uint8 chain_id) {
    _cid = chain_id;
  }

  function add_verifier(address verifier) public returns (uint) {
    uint cursor = verifiers.length;
    verifiers.push(Verifier(verifier));
    return cursor;
  }

  function _l1_address(address account) private view returns (uint256) {
    return (uint256(uint160(account))) + (uint256(_cid) << 160);
  }

  function _get_verifier(uint256 call_info) private view returns(Verifier) {
    bytes memory info = abi.encodePacked(call_info);
    return verifiers[uint8(info[0])];
  }

  function _get_delta_code(uint256 call_info) private pure returns(uint8) {
    bytes memory info = abi.encodePacked(call_info);
    return uint8(info[0]);
  }

  function _set_balance(uint256 token_id, uint256 l2account, uint256 amount) private {
    _balances[token_id][l2account] = amount;
  }

  function _set_pool(uint256 pool_id, uint256 amount0, uint256 amount1) private {
    _pools[pool_id].l0 = amount0;
    _pools[pool_id].l1 = amount1;
  }

  function _withdraw(uint256 tokenid, uint256 amount, uint256 l1recipent) public {
    address token = address(uint160(tokenid));
    require(_l1_address(token) == tokenid, "Withdraw: incorrect token_id");
    address recipent = address(uint160(l1recipent));

    // Sanitity checks
    require(recipent!= address(0), "Withdraw to the zero address");
    require(_l1_address(recipent) == l1recipent, "Withdraw: incorrect l1recipent");

    // transfer amount back to recipent
    IERC20 underlying_token = IERC20(token);
    underlying_token.transfer(recipent, amount);
  }


  function nonceOf(uint256 l2account) public view returns(uint256) {
    return _nonce[l2account];
  }

  function deposit(address token, uint256 amount, uint256 l2account) public {
    IERC20 underlying_token = IERC20(token);
    uint256 balance = underlying_token.balanceOf(msg.sender);
    require(balance >= amount, "Insuffecient Balance");
    underlying_token.transferFrom(msg.sender, address(this), amount);
    uint256 token_id = _l1_address(token);
    _balances[token_id][l2account] += amount;
    _nonce[l2account] += 1;
    emit Deposit(_l1_address(token), l2account, amount , _nonce[l2account]);
  }

  function balanceOf(uint256 account, uint256 token_id) public view returns(uint256) {
    return _balances[token_id][account];
  }

  /*
   * @dev deltas encode the update function
   * deltas = [| opcode; args |]
   */
  function _update_state(uint256[] memory deltas) private {
    uint8 delta_code = _get_delta_code(deltas[0]);
    if (delta_code == _WITHDRAW) {
      require(deltas.length == 4, "Withdraw: Insufficient arg number");
      _withdraw(deltas[1], deltas[2], deltas[3]);
    } else if (delta_code == _SET_BALANCE) {
      require(deltas.length == 4, "Withdraw: Insufficient arg number");
      _set_balance(deltas[1], deltas[2], deltas[3]);
    } else if (delta_code == _SET_POOL) {
      require(deltas.length == 3, "Withdraw: Insufficient arg number");
      _set_pool(deltas[1], deltas[2], deltas[3]);
    }
  }

  /*
   * @dev Data encodes the delta functions with there verification in reverse order
   * data = opcode args; opcode' args'; ....
   */
  function verify(uint256 account, uint256[] memory data,
    uint256 nonce, uint256 rid) public {
    //require(_nonce[account] == nonce, "Verify: Nonce does not match!");
    require (data.length != 0, "Verify: Insufficient delta operations");
    uint cursor = 0;
    while (cursor < data.length) {
      uint256 op_code = data[cursor];
      cursor += 1;
      Verifier verifier = _get_verifier(op_code);
      uint256[] memory update = verifier.verify(data, cursor);
      _update_state(update);
      cursor += verifier.nbArgs();
    }
    emit SwapAck(account, rid);
  }

  function chainID() public view returns(uint256) {
    return _cid;
  }

}
