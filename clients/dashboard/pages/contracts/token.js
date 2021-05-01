const Web3 = require("web3")
const Config = require("../../lib/config")

let web3 = new Web3(Config.web3_source);

export async function getStaticProps() {
  const blockNumber= await web3.eth.getBlockNumber();
  return {
    props: {
      blockNumber
    }
  }
}

export default function Token(t) {
  return <h1>{t.blockNumber}</h1>
}
