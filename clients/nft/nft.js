const Web3 = require("web3")
const Client = require("web3subscriber/client")

class NftClient {
  constructor(web3, config, tinfo, nftinfo, biddinginfo, account) {
    this.account = account;
    this.token = Client.getContract(web3, config, tinfo, account);
    this.nft = Client.getContract(web3, config, nftinfo, account);
    this.bidding = Client.getContract(web3, config, biddinginfo, account);
  }
  async mint(id) {
    let tx = await this.nft.methods.mint(id).send();
  }

  async auction(id, price) {
    var bidding_address = this.bidding.options.address;
    var tx = await this.nft.methods.approve(bidding_address, id);
    tx = await this.bidding.methods.auction(id, price).send();
    return tx;
  }

  async bid(id, price) {
    var bidding_address = this.bidding.options.address;
    var tx = await Client.approveBalance(this.token, bidding_address, price);
    tx = await this.bidding.methods.bidding(id, price).send();
    return tx;
  }

  async getOwner(id) {
    let r = await this.nft.methods.ownerOf(id).call();
    return r;
  }

  async getAuctionInfo(id) {
    let r = await this.bidding.methods.getAuctionInfo(id).call();
    return r;
  }

  async finalize(id) {
    let tx = await this.bidding.methods.finalize(id).call();
    return tx;
  }
}

module.exports = {
   NftClient: NftClient,
}
