DATA_DIR=$1
ADDRESS="0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b"
geth --unlock $ADDRESS --mine --networkid 15 --identity "LocalTestNode" --ws --rpc --allow-insecure-unlock --datadir $DATA_DIR console
