pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
contract NFT is ERC721{
  event Mint(uint256 tokenId, bool status);
  constructor() ERC721("UniqueAsset", "UNA") {}
  function mint(uint256 tokenId) public {
    emit Mint(tokenId, true);
    _safeMint(msg.sender, tokenId, "");
  }
  function test_mint(uint256 tokenId) public {
    _mint(msg.sender, tokenId);
  }
}
