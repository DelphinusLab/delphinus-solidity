// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract Bridge {

  event Deposit(uint256 l1token, uint256 l2account, uint256 amount, uint256 nonce);
  event WithDraw(uint256 l1account, uint256 l2account, uint256 amount, uint256 nonce);
  event SwapAck(uint256 l2account, uint256 rid);

  struct PoolInfo {
    uint256 l0;
    uint256 l1;
  }

  address private owner;
  uint8 private _cid;
  mapping (uint256 => mapping(uint256 => uint256)) private _balances;
  mapping (uint256 => mapping(uint256 => PoolInfo)) private _pools;
  mapping (uint256 => uint256) private _nonce;

  constructor(uint8 chain_id) {
    _cid = chain_id;
  }

  function _l1_address(address account) private view returns (uint256) {
    return (uint256(uint160(account))) + (uint256(_cid) << 160);
  }

  function nonceOf(uint256 l2account) public view returns(uint256) {
    return _nonce[l2account];
  }

  function balanceOf(uint256 account, uint256 token_id) public view returns(uint256) {
    return _balances[token_id][account];
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

  function withdraw(uint256 l2account, address token, uint256 amount, address recipent, uint256 nonce) public {

    require(_nonce[l2account] == nonce, "Withdraw: Nonce does not match!");
    uint256 token_id = _l1_address(token);

    // Sanitity checks
    require(recipent!= address(0), "Withdraw to the zero address");

    uint256 sender_balance = _balances[token_id][l2account];
    require(sender_balance >= amount, "Bidding: Insufficient amount to withdraw");
    _balances[token_id][l2account] = sender_balance - amount;

    // transfer amount back to recipent
    IERC20 underlying_token = IERC20(token);
    underlying_token.transfer(recipent, amount);

    // update nonce
    _nonce[l2account] += 1;

    emit WithDraw(_l1_address(recipent), l2account, amount, _nonce[l2account]);

  }

  function batch(uint256 account, uint256[] memory data, uint256 nonce, uint256 rid) public {
    uint256 token0 = data[0];
    uint256 token1 = data[1];
    uint256 amount0 = data[2];
    uint256 amount1 = data[3];

    require(_nonce[account] == nonce, "Withdraw: Nonce does not match!");
    uint256 account_balance = _balances[token0][account];
    require(account_balance >= amount0, "Swap: Insufficient amount to swap");

    _balances[token0][account] -= amount0;
    _balances[token1][account] += amount1;

    _nonce[account] += 1;

    emit SwapAck(account, rid);
  }

  function getAddress() public view returns(address) {
    return msg.sender;
  }

}
