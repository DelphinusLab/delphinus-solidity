pragma solidity ^0.8.0;
contract Check{
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
  function check_encode(uint256 c) public pure returns (uint8) {
    bytes memory info = abi.encodePacked(c);
    return uint8(info[0]);
  }
}
