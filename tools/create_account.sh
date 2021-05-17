DATA_DIR=$1
ADDRESS="0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b"
geth account import --datadir $DATA_DIR $2 key.prv
