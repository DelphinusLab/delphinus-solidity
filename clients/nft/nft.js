const Web3 = require("web3")
const Client = require("web3subscriber/client")
const PBinder= require("web3subscriber/pbinder")

/*
async handle_generic_transaction(send_promise, hash_cb, ) {
  send_promise.send()
  .on('transactionHash'), function(hash)
}
*/

class NftClient {
  constructor(web3, config, tinfo, nftinfo, biddinginfo, account) {
    this.account = account;
    this.token = Client.getContract(web3, config, tinfo, account);
    this.nft = Client.getContract(web3, config, nftinfo, account);
    this.bidding = Client.getContract(web3, config, biddinginfo, account);
  }
  async mint(id) {
    let tx = await this.nft.methods.mint(id).send();
    return tx;
  }

  auction(id, price) {
    let pbinder = new PBinder.PromiseBinder();
    let r = pbinder.return (async () => {
      var bidding_address = this.bidding.options.address;
      var tx = await pbinder.bind("approve",
        this.nft.methods.approve(bidding_address, id).send()
      );
      tx = await pbinder.bind("auction",
        this.bidding.methods.auction(id, price).send()
      );
      return tx;
    });
    return r;
  }

  async bid(id, price) {
    // bidding_address is never used
    //var bidding_address = this.bidding.options.address;
    //invalid function argument, change bidding_address to this.bidding
    var tx = await Client.approveBalance(this.token, this.bidding, price);
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
    // the state is changed so use send rather than call
    //let tx = await this.bidding.methods.finalize(id).send();
    let tx = await this.bidding.methods.finalize(id).send();
    return tx;
  }
}

module.exports = {
   NftClient: NftClient,
}
