const fs = require('fs');
const { format } = require('date-fns');
const logEvents = require( "./logEvents" );
const EventEmitter = require( 'events' );
class Emitter extends EventEmitter { };

const logEmitter = new Emitter(); 

logEmitter.on('log', (msg, fileName) => logEvents(msg, fileName)); //Listener

const editFile = async (path, Name ) => {
    
    const dateTime = `${ format( new Date(), 'ddMMyyyy\tHH:mm:ss' )}`;
    const file = path;
    const saveName = Name;

    try {
        const File = fs.readFileSync( file, { encoding: 'utf-8'} );
        var json = await JSON.parse(File);
        var data = Object.values(json.records)
        const newData = JSON.stringify(data, null, 2)
        fs.writeFileSync( saveName, newData, { encoding: 'utf-8' })
        return 

    } catch (err) {
        console.log( `${ dateTime }: The following error occured while edting data file: ${ err }`);
        logEmitter.emit('log', `${err}`, 'errors.txt')
    }
}

//editFile(); // Debugging purposes

module.exports = editFile;
