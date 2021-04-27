// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract Bridge {

  event Deposit(uint256 l1account, uint256 l2account, uint256 amount, uint256 balance);
  event WithDraw(uint256 l1account, uint256 l2account, uint256 amount, uint256 balance);
  event SwapAck(uint256 l2account, uint256 token0, uint256 token1, uint256 amount);

  struct PoolInfo {
    uint256 l0;
    uint256 l1;
  }

  address private owner;
  uint8 private _cid;
  mapping (uint256 => mapping(uint256 => uint256)) private _balances;
  mapping (uint256 => mapping(uint256 => PoolInfo)) private _pools;

  constructor(uint8 chain_id) {
    _cid = chain_id;
  }

  function _l1_address(address account) private returns (uint256) {
    return (uint256(uint160(account))) + (uint256(_cid) << 160);
  }

  function deposit(address token, uint256 amount, uint256 l2account) public {
    IERC20 underlying_token = IERC20(token);
    uint256 balance = underlying_token.balanceOf(msg.sender);
    require(balance >= amount, "Insuffecient Balance");
    underlying_token.transferFrom(msg.sender, address(this), amount);
    uint256 token_id = _l1_address(token);
    _balances[token_id][l2account] += amount;
    emit Deposit(_l1_address(msg.sender), l2account, amount , _balances[token_id][l2account]);
  }

  function withdraw(uint256 l2account, address token,
      uint256 amount, address recipent) public {

    uint256 token_id = _l1_address(token);

    // Sanitity checks
    require(recipent!= address(0), "Withdraw to the zero address");

    uint256 sender_balance = _balances[token_id][l2account];
    require(sender_balance >= amount, "Bidding: Insufficient amount to withdraw");
    _balances[token_id][l2account] = sender_balance - amount;

    // transfer amount back to recipent
    IERC20 underlying_token = IERC20(token);
    underlying_token.transfer(recipent, amount);

    emit WithDraw(_l1_address(recipent), l2account,
        amount, _balances[token_id][l2account]);

  }

  function swap(uint256 sender, uint256 token0, uint256 token1,
    uint256 amount) public {

    uint256 sender_balance = _balances[token0][sender];
    require(sender_balance >= amount, "Swap: Insufficient amount to swap");

    _balances[token0][sender] -= amount;
    _balances[token1][sender] += amount;

    emit SwapAck(sender, token0, token1, amount);
  }

  function balanceOf(uint256 account, uint256 token_id) public view returns(uint256) {
    return _balances[token_id][account];
  }
  function getAddress() public view returns(address) {
    return msg.sender;
  }
  function getThisAddress() public view returns(address) {
    return address(this);
  }
}
