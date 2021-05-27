DATA_DIR=$1
ADDRESS="0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b"
mkdir ${DATA_DIR}1
geth account import --datadir ${DATA_DIR}1 key.prv
geth --datadir ${DATA_DIR}1 init genesis1.json
mkdir ${DATA_DIR}2
geth account import --datadir ${DATA_DIR}2 key.prv
geth --datadir ${DATA_DIR}2 init genesis2.json
