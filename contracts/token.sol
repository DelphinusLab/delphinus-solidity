// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
contract Token is ERC20{
  constructor() ERC20("Test Token", "TestToken") {}
  function mint(uint256 amount) public {
    _mint(msg.sender, amount);
  }
  function getBalance() public view returns (uint256) {
    return balanceOf(msg.sender);
  }
}
