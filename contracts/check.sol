pragma solidity ^0.8.0;
contract CHECK{
  event Tester(string message, bool status);
  string public name = "name";
  constructor() {}
  function test_mint(uint256 tokenId) public pure returns (uint256) {
    return tokenId;
  }
  function change_name(string memory n) public returns (string memory) {
    name = n;
    emit Tester("MINT", true);
    return name;
  }
  function get_name() public view returns (string memory) {
    return name;
  }
}
