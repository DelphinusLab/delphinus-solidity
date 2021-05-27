set -x

DATA_DIR=$1
ADDRESS="0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b"

if [ ! -z $2 ]; then
  password="--password $2"
fi

if [ ! -z $3 ]; then
  miner="--mine --miner.threads $3"
fi

geth --unlock $ADDRESS --mine --networkid 16 --identity "LocalTestNode2" --ws --ws.port 8746 --rpc --http.port 8745 --allow-insecure-unlock --datadir $DATA_DIR console $password $miner --port 30302
