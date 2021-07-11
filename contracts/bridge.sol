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
    uint256 token0;
    uint256 token1;
    uint256 l0;
    uint256 l1;
  }

  PoolInfo[] private _pools;

  address private owner;
  uint32 private _cid;

  uint8 constant _SET_BALANCE = 0x1;
  uint8 constant _SET_POOL = 0x2;
  uint8 constant _WITHDRAW = 0x3;
  uint8 constant _SET_SHARE = 0x4;

  mapping (uint256 => mapping(uint256 => uint256)) private _balances;
  mapping (uint256 => mapping(uint256 => uint256)) private _pool_ids;
  mapping (uint256 => mapping(uint256 => uint256)) private _pool_share; // pid => l1 account => share
  mapping (uint256 => uint256) private _nonce;


  constructor(uint32 chain_id) {
    _cid = chain_id;
    _pools.push(PoolInfo(0,0,0,0));
  }

  function add_pool(uint256 token0, uint256 token1) private returns (uint) {
    uint cursor = _pools.length;
    _pools.push(PoolInfo(token0, token1, 0, 0));
    return cursor;
  }

  function get_pool(uint256 token0, uint256 token1) public view returns (PoolInfo memory) {
    uint256 _pid = _pool_ids[token0][token1];
    return _pools[_pid];
  }

  function _set_pool(uint256 token0, uint256 token1, uint256 amount0, uint256 amount1) private {
    uint256 _pid = _pool_ids[token0][token1];
    if (_pid == 0) {
      _pid = add_pool(token0, token1);
    }
    _pools[_pid].token0 = token0;
    _pools[_pid].token1 = token1;
    _pools[_pid].l0 = amount0;
    _pools[_pid].l1 = amount1;
  }

  function _set_share(uint256 token0, uint256 token1, uint256 l2account, uint256 share) private {
    uint256 _pid = _pool_ids[token0][token1];
    require(_pid!= 0, "SetShare for non-exist token pair");
    _pool_share[_pid][l2account] = share;
  }

  function add_verifier(address verifier) public returns (uint) {
    uint cursor = verifiers.length;
    verifiers.push(Verifier(verifier));
    return cursor;
  }

  function _l1_address(address account) private view returns (uint256) {
    return (uint256(uint160(account))) + (uint256(_cid) << 160);
  }

  function _is_local(uint256 l1address) private view returns (bool) {
    return ((l1address >> 160) == (uint256(_cid)));
  }

  function _get_verifier(uint256 call_info) private view returns(Verifier) {
    bytes memory info = abi.encodePacked(call_info);
    require(verifiers.length == 3, "Insufficient verifiers");
    require(verifiers.length > uint8(info[0]), "Call Info index out of bound");
    return verifiers[uint8(info[0])];
  }

  function _get_delta_code(uint256 call_info) private pure returns(uint8) {
    bytes memory info = abi.encodePacked(call_info);
    return uint8(info[0]);
  }

  function _set_balance(uint256 token_id, uint256 l2account, uint256 amount) private {
    _balances[token_id][l2account] = amount;
  }

  function _withdraw(uint256 tokenid, uint256 amount, uint256 l1recipent) public {
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


  function nonceOf(uint256 l2account) public view returns(uint256) {
    return _nonce[l2account];
  }

  function createPool(uint256 token1, uint256 token2) public returns (uint) {
    PoolInfo memory pool = PoolInfo(token1, 0, token2, 0);
    _pools.push(pool);
    return (_pools.length - 1);
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

  function balanceOf(uint256 account, uint256 token_id) public view returns(uint256) {
    return _balances[token_id][account];
  }

  /*
   * @dev deltas encode the update function
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
      } else if (delta_code == _SET_BALANCE) {
        require(deltas.length >= cursor + 4, "SetBalance: Insufficient arg number");
        _set_balance(deltas[cursor+1], deltas[cursor+2], deltas[cursor+3]);
        cursor = cursor + 4;
      } else if (delta_code == _SET_POOL) {
        require(deltas.length >= cursor + 5, "SetPool: Insufficient arg number");
        _set_pool(deltas[cursor+1], deltas[cursor+2], deltas[cursor+3], deltas[cursor+4]);
        cursor = cursor + 5;
      } else if (delta_code == _SET_SHARE) {
        require(deltas.length >= cursor + 5, "SetShare: Insufficient arg number");
        _set_share(deltas[cursor+1], deltas[cursor+2], deltas[cursor+3], deltas[cursor+4]);
        cursor = cursor + 5;
      }
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
      cursor += verifier.getVerifierInfo().nbArgs;
    }
    emit SwapAck(account, rid);
  }

  function getVerifierInfo(uint index) public view returns (VerifierInfo memory) {
    Verifier verifier = verifiers[index];
    return verifier.getVerifierInfo();
  }


  function chainID() public view returns(uint256) {
    return _cid;
  }

}
