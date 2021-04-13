pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
contract NFT is ERC721{
  event Tester(string message, bool status);
  constructor() ERC721("UniqueAsset", "UNA") {}
  //function mint(uint256 tokenId) public {
    //_safeMint(msg.sender, tokenId, "");
  //}
  function test_mint(uint256 tokenId) public {
    _mint(msg.sender, tokenId);
    emit Tester("MINT", true);
  }
}
