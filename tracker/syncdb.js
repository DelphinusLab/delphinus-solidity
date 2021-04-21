const Mongo = require('mongodb');
const Web3 = require("web3")
const FileSys = require("fs")

function get_abi_events(api_file) {
  let abi_data = FileSys.readFileSync(api_file);
  let data_json = JSON.parse(abi_data);
  let abi_json = data_json.abi;
  let events = [];
  abi_json.forEach(t => {
    if (t.type=="event") {
      events.push(t);
    }
  });
  return events;
}

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
  return v;
}

async function foldM (as, init, f) {
  let c = init;
  for (i=0;i<as.length;i++) {
    c = await f(c, as[i]);
  }
  return c;
}

class EventTracker {
  constructor(network_id, abi_file, config, handlers) {
    this.config = config;
    let web3 = new Web3(config.web3_source);
    let abi_data = FileSys.readFileSync(abi_file);
    let data_json = JSON.parse(abi_data);
    this.abi_json = data_json.abi;
    this.events = get_abi_events(abi_file);
    this.address = data_json.networks[network_id].address;
    this.contract = new web3.eth.Contract(this.abi_json, this.address, {
      from:config.monitor_account
    });
    this.handlers = handlers;
  }


  async record_event (db, event) {
    let info_collection = await get_info_collection(db);
    let lastblock = await get_last_monitor_block(info_collection, event);
    console.log ("monitor %s from %s", event.name, lastblock);
    let past_events = await this.contract.getPastEvents(event.name, {
        fromBlock:lastblock, toBlock:"latest"
    });
    return await foldM (past_events, [], async (acc, r) => {
      let e = await update_last_monitor_block(info_collection, event, r);
      acc.push(this.handlers(event.name, e));
      return (acc);
    });
  }

  record_events (db) {
    let es = this.events.map (t => {
        let event_track = this.record_event (db.db(), t);
        return event_track;
    });
    return es;
  }

  async subscribe_event (db, event) {
    let info_collection = await get_info_collection(db);
    let lastblock = await get_last_monitor_block(info_collection, event);
    console.log ("monitor %s from %s", event.name, lastblock);
    let r = await this.contract.events[event.name](
        {fromBlock:lastblock}
    );
    r.on("connected", subscribe_id => {
      console.log(subscribe_id);
    })
    .on('data', async (r) => {
      console.log("subscribe event: %s", event.name);
      let e = await update_last_monitor_block(info_collection, event, r);
      this.handlers(event.name, e);
    });
    return true;
  }

  async track_events () {
    let url = this.config.mongodb_url + "/" + this.address;
    let db = await Mongo.MongoClient.connect(url, {useUnifiedTopology: true});
    let ps = this.record_events(db);
    return Promise.all(ps);
  }

  async subscribe_events () {
    let url = this.config.mongodb_url + "/" + this.address;
    let db = await Mongo.MongoClient.connect(url, {useUnifiedTopology: true});
    let ps = this.events.map (t => {
        let event_track = this.subscribe_event (db.db(), t);
        return event_track;
    });
    return Promise.all(ps);
  }

  async reset_events_info (db) {
    let info_collection = await get_info_collection(db);
    let p = Promise.resolve(1);
    this.events.forEach(event => {
        p = p.then (x => info_collection.deleteMany({name:event.name}))
    });
    return p;
    let r = await p;
    return r;
  }

  async reset_events () {
    let url = this.config.mongodb_url + "/" + this.address;
    let db = await Mongo.MongoClient.connect(url, {useUnifiedTopology: true});
    return (await this.reset_events_info(db.db(), this.events));
  }
}




module.exports = {
  EventTracker: EventTracker
}
