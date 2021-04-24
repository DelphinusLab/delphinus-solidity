pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract Bridge {
  IERC20 private underlying_token;
  event Deposit(address account, uint256 amount, uint256 balance);
  event WithDraw(address account, uint256 amount, uint256 balance);
  event TransferAck(address account, uint256 recipent, uint256 amount);

  address private owner;
  mapping (address => uint256) private _balances;


  constructor(address token) {
    underlying_token = IERC20(token);
  }

  function deposit(uint256 amount) public {
    uint256 balance = underlying_token.balanceOf(msg.sender);
    require(balance >= amount, "Insuffecient Balance");
    underlying_token.transferFrom(msg.sender, address(this), amount);
    _balances[msg.sender] += amount;
    emit Deposit(msg.sender, amount, _balances[msg.sender]);
  }

  function withdraw(address account, uint256 amount) public {
    require(account!= address(0), "Withdraw to the zero address");
    uint256 sender_balance = _balances[account];
    require(sender_balance >= amount, "Bidding: Insufficient amount to withdraw");
    underlying_token.transfer(account, amount);
    _balances[account] -= sender_balance - amount;
    emit WithDraw(account, amount, _balances[account]);
  }

  function transfer(address account, uint256 amount, uint256 recipent) public {
    _balances[account] -= amount;
    emit TransferAck(account, recipent, amount);
  }

  function balanceOf(address account) public view returns(uint256) {
    return _balances[account];
  }
  function getAddress() public view returns(address) {
    return msg.sender;
  }
  function getThisAddress() public view returns(address) {
    return address(this);
  }
}
