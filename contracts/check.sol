pragma solidity ^0.8.0;
contract CHECK{
  event Tester(string message, bool status);
  string public name = "name";
  constructor() {}
  function test_mint(uint256 tokenId) public returns (uint256) {
    emit Tester("MINT", true);
    return tokenId;
  }
  function change_name(string memory n) public returns (string memory) {
    name = n;
    emit Tester("MINT", true);
    return name;
  }
  function get_name() public returns (string memory) {
    emit Tester("MINT", true);
    return name;
  }
}
