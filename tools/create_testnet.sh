ADDRESS="0x6f6ef6dfe681b6593ddf27da3bfde22083aef88b"
PASSWORD=123

echo $PASSWORD > .password

mkdir testnet1.backup
geth account import --datadir testnet1.backup key.prvgeth --datadir testnet1.backup init genesis1.json

mkdir testnet2.backup
geth account import --datadir testnet2.backup key.prv
geth --datadir testnet1.backup init genesis2.json
