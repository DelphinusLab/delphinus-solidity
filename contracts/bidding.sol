// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Bidding {
  string public brand = "NFT Bid Contract";
  string public myString = "Wind Following Dog's Bidding Contract";
  IERC20 private underlying_token;
  IERC721 private underlying_nft;

  event Bid(uint256 tokenId, uint256 price);
  event Finalize(uint256 tokenId, uint256 price);

  struct BiddingInfo {
    address owner;
    address winner;
    uint256 price;
  }

  mapping (uint256 => BiddingInfo) private _assets;

  constructor(address token, address nft) {
    underlying_token = IERC20(token);
    underlying_nft = IERC721(nft);
  }

  function _bid_entry(address owner, uint256 price) pure private returns (BiddingInfo memory bi) {
    return BiddingInfo(owner, address(0), price);
  }

  function auction(uint256 tokenId, uint256 start_price) public {
    require(_assets[tokenId].owner == address(0), "The bindding already exists");
    underlying_nft.transferFrom(msg.sender, address(this), tokenId);
    _assets[tokenId] = _bid_entry(msg.sender, start_price);
  }

  function getAuctionInfo(uint256 tokenId) public view returns (BiddingInfo memory bi) {
    return _assets[tokenId];
  }

  function bidding(uint256 tokenId, uint256 price) public {
    BiddingInfo memory winner = _assets[tokenId];
    address winner_address = winner.winner;
    uint256 final_price = winner.price;
    require (price > final_price, "Bid at a lower price");

    // we first have to make sure the sender has enough token to bid
    underlying_token.transferFrom(msg.sender, address(this), price);

    // return back the final price to the laster bidder *)
    if (winner_address != address(0)) {
      // Not the first bidder, return token back to the last bidder
      underlying_token.transfer(winner_address, final_price);
    }
    winner.winner = msg.sender;
    winner.price = price;
    _assets[tokenId] = winner;
  }


  function finalize(uint256 tokenId) public {
    BiddingInfo memory winner = _assets[tokenId];
    address winner_address = winner.winner;
    address owner_address = winner.owner;
    uint256 final_price = winner.price;
    require (winner_address != address(0), "The bidding asset does not exists");
    delete _assets[tokenId];
    underlying_nft.transferFrom(address(this), winner_address, tokenId);
    underlying_token.transfer(owner_address, final_price);
  }
}
