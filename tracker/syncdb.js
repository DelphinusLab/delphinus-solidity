const Mongo = require('mongodb');
const Web3 = require("web3")
const FileSys = require("fs")
const Config = require("./config.js");

let web3 = new Web3(Config.web3_source);

async function get_info_collection(db) {
  let collections = await db.listCollections({name:"MetaInfoCollection"}).toArray();
  if (collections.length == 0) {
    console.log("Initial MetaInfoCollection");
    let c = await db.createCollection("MetaInfoCollection");
    return c;
  } else {
    let c = db.collection("MetaInfoCollection");
    return c;
  }
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

async function get_last_monitor_block(info_collection, event) {
  let rs = await info_collection.find({name:event.name}).toArray();
  if (rs.length == 0) {console.log("create collection  %s!", event.name);return 0;}
  else {
    console.log(rs[0]);
    return(rs[0].lastblock);
  }
}

async function update_last_monitor_block(info_collection, event, r) {
  let result = await info_collection.updateOne({name:event.name},
    {$set:{lastblock:r.blockNumber}},
    {upsert:true});
  let v = {};
  event.inputs.forEach(i => {
    v[i.name] = r.returnValues[i.name];
  });
  //console.log(result.result);
  return v;
}

async function foldM (as, init, f) {
  let c = init;
  for (i=0;i<as.length;i++) {
    c = await f(c, as[i]);
  }
  return c;
}

async function record_event (db, event, abi_json, contract_addr, handlers) {
  let contract = new web3.eth.Contract(abi_json, contract_addr, {
    from:Config.monitor_account
  });
  let info_collection = await get_info_collection(db);
  let lastblock = await get_last_monitor_block(info_collection, event);
  console.log ("monitor %s from %s", event.name, lastblock);
  let past_events = await contract.getPastEvents(event.name, {
      fromBlock:lastblock, toBlock:"latest"
  });

  return await foldM (past_events, [], async (acc, r) => {
    let e = await update_last_monitor_block(info_collection, event, r);
    acc.push(handlers(event.name, e));
    return (acc);
  });
}

function record_events(db, abi_json, events, contract_addr, handlers) {
  let es = events.map (t => {
      let event_track = record_event (db.db(), t, abi_json, contract_addr, handlers);
      console.log(event_track);
      return event_track;
  });
  return es;
}

async function track_events(address, api_file, handlers) {
  let abi_data = FileSys.readFileSync(api_file);
  let abi_json = JSON.parse(abi_data).abi;
  let events = get_abi_events(api_file);
  let url = Config.mongodb_url + "/" + address;
  let db = await Mongo.MongoClient.connect(url, {useUnifiedTopology: true});
  let ps = record_events(db, abi_json, events, address, handlers);
  return Promise.all(ps);
}

async function reset_events_info(db, events) {
  let info_collection = await get_info_collection(db);
  let p = Promise.resolve(1);
  events.forEach(event => {
      p = p.then (x => info_collection.deleteMany({name:event.name}))
  });
  r = await p;
  return r;
}

async function reset_events(address, api_file) {
  let abi_data = FileSys.readFileSync(api_file);
  let abi_json = JSON.parse(abi_data).abi;
  let events = get_abi_events(api_file);
  let url = Config.mongodb_url + "/" + address;
  let db = await Mongo.MongoClient.connect(url, {useUnifiedTopology: true});
  return (await reset_events_info(db.db(), events));
}

module.exports = {
  track_events: track_events,
  reset_events: reset_events
}
