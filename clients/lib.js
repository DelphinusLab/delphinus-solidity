const NFTTest = require("./nft/test");
const TokenTest = require("./token/test");

TokenTest.test().then(v => {console.log("test done!");});
NFTTest.test().then(v => {console.log("test done!");});
