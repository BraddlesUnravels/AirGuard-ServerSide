const fetch = require('node-fetch');
const logEvents = require('./logEvents');
const EventEmitter = require('events');
const { stat } = require("fs");
const Creds = require('./configurations/keys')
class Emitter extends EventEmitter { };

const logEmitter = new Emitter();

logEmitter.on('log', (msg, fileName) => logEvents(msg, fileName)); //Listener


const reqApi = async () => {
    try {
        const reqApi = Creds.EPA_Gateway; 
        const res = await fetch(reqApi, {
            headers: {
                'X-API-Key': Creds.EPA_Gateway_KEY,
                'Content-Type': 'application/json'
            },
        });
        const data = await res.json();
        return data;
    } catch(err) {
        logEmitter.emit('log', `${err}`, 'errors.txt'); //error handling needs work not logging correctly
    };
};

//reqApi().then((data) => console.log(data)); // Used for debugging

    
module.exports = reqApi;