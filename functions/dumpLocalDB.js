const fetch = require('node-fetch');
const logEvents = require('./logEvents');
const { stat } = require("fs");
const path = require('path');
const fs = require('fs');
const EventEmitter = require('events');
const { MongoClient } = require('mongodb')
class Emitter extends EventEmitter { };
const myEmitter = new Emitter();
const Creds = require('../configurations/keys')

myEmitter.on('log', (msg, fileName) => logEvents(msg, fileName)); //Listener

const url = Creds.MONGODB_Connection_String; // mongoDB client connection string
const client = new MongoClient(url);
const { format } = require('date-fns');
const dateTime = `${format(new Date(), 'ddMMyyyy\tHH:mm:ss')}`;
const dbname = 'AIRMON_DB';

async function mongoDBdumpData() {
    
    try {
        await client.connect();
        console.log(`\n${dateTime}: mongoDB link successfully established`);
        const db = client.db(dbname);
        // Collection airQual selected
        const col = db.collection('airQual');

        // Load json file
        const file = fs.readFileSync('./database/airQualityReadings/currentApiData.json');
        // Parse to send JSON data
        const _file = JSON.parse(file);
        const assignOBJ = Object.assign( {}, _file )
        // Insert Document
        let Document = assignOBJ;

        const put = await col.insertOne(Document);

        const myDoc = await col.findOne();

        console.log(myDoc);

    } catch(err) {
        myEmitter.emit('log', `Error occured establishing mongoDB link: ${err.stack}`, 'errors.txt'); //error handling needs work not logging correctly
    }

    finally {
        await client.close();
        console.log(`\n${dateTime}: mongoDB client connection closed.`)
    }
};

//mongoDBdumpData().catch(console.dir); // Used for debugging

module.exports = mongoDBdumpData;