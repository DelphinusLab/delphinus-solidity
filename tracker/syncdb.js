const Mongo = require('mongodb');
const Web3 = require("web3")
const FileSys = require("fs")
const Config = require("./config.js");

let web3 = new Web3(Config.web3_source);

function get_info_collection(db, callback) {
  db.listCollections({name:"MetaInfoCollection"}).toArray((err, collections) => {
    console.log(collections);
    if (collections.length == 0) {
      console.log("Initial MetaInfoCollection");
      db.createCollection("MetaInfoCollection", function(err, c) {
        callback(c);
      });
    } else {
      db.collection("MetaInfoCollection", function(err, c) {
        callback(c);
      });
    }
  });
}

function create_collection(db, event_name) {
  db.db().createCollection(event_name, function(err, res) {
    if (err) throw err;
    console.log("Collection " + event_name + " created!");
  });
}

function get_abi_events(api_file) {
  let abi_data = FileSys.readFileSync(api_file);
  let abi_json = JSON.parse(abi_data).abi;
  let events = [];
  abi_json.forEach(t => {
    if (t.type=="event") {
      events.push(t);
    }
  });
  return events;
}

function as_last_monitor_block(info_collection, event, callback) {
  let entries = info_collection.find({name:event.name})
  .toArray((err, rs) => {
    if (err) throw err;
    else {
      if (rs.length == 0) {console.log("start with empty!");callback(0);}
      else callback(rs[0].lastblock);
    }
  });
}

function update_last_monitor_block(info_collection, event, r, cb) {
  info_collection.updateOne({name:event.name},
    {$set:{lastblock:r.blockNumber}},
    {upsert:true},
    (err, result) => {
      if(err) throw err;
      let v = {};
      event.inputs.forEach(i => {
        v[i.name] = r.returnValues[i.name];
      });
      console.log(result.result);
      cb(v);
  });
}

function record_event (db, event, abi_json, contract_addr, handlers) {
  let contract = new web3.eth.Contract(abi_json, contract_addr, {
    from:Config.monitor_account
  });
  get_info_collection(db, info_collection => {
    as_last_monitor_block(info_collection, event, lastblock => {
      contract.getPastEvents(event.name, {
          fromBlock:lastblock, toBlock:"latest"
        },
        (error, result) => {
          console.log ("monitor block " + lastblock);
          if (error) {
            throw error;
          }
          result.forEach(r => {
            console.log("event " + event.name + " update till block " + r.blockNumber);
            update_last_monitor_block(info_collection, event, r, handlers);
          });
        }
      );
    });
  });
}

function record_events(db, abi_json, events, contract_addr, handlers) {
  events.forEach(t => {
      record_event (db.db(), t, abi_json, contract_addr, handlers);
    }
  );
}

function track_events(address, api_file, handlers) {
  let abi_data = FileSys.readFileSync(api_file);
  let abi_json = JSON.parse(abi_data).abi;
  let events = get_abi_events(api_file);
  let url = Config.mongodb_url + "/" + address;
  Mongo.MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db) {
    if (err) throw err;
    record_events(db, abi_json, events, address, handlers)
  });
}


module.exports = {
  track_events: track_events
}
