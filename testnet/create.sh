DATA_DIR=$1
ADDRESS="0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b"
geth account import --datadir $DATA_DIR $2
geth --datadir $DATA_DIR init genesis.json
geth --unlock $ADDRESS --mine --networkid 15 --identity "LocalTestNode" --ws --allow-insecure-unlock --datadir $DATA_DIR console
