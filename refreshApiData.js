const { format } = require('date-fns');
const path = require('path');
const fs = require('fs');
const Api = require('./reqApi') // Dedicated Api request function
const editFile = require( './editFile');
const mongoDBdumpData = require( './dumpLocalDB' );

// DataTime variable set for function
const dateTime = `${format(new Date(), 'ddMMyyyy\tHH:mm:ss')}`;

// Refreshes the local storage of api data whenever the module is called by server.js
const refreshApiData = async () => {

  const dateHour = `${format(new Date(), 'dd-MM-yyyy_HH')}`; // Saved in file name to avoid overwriting previous hours file

  //await mongoDBdumpData(); // Disabled while in development. Currently unclear how this wil be used and needs to be thought out further. It was done as an attempt to get around needing a SSL certificate

  await fs.rename('./database/airQualityReadings/currentApiData.json', `./database/airQualityReadings/recordDate_${dateHour}.json`, function(err) { 

    if ( err ) console.log(`${dateTime}\tThe following achriving error occured: ${err}`)

  }) //fs.rename changes the name of the current data file before overwriting it. Temp Archive solution

  await Api().then((data) => {
    
    var _data = JSON.stringify(data, null, 2); // Convert Api response to string to write to file
    
    try {

      const currentApiData = `./database/airQualityReadings/currentApiData.json`;

      fs.writeFile( currentApiData, _data, finished); // Paste '${dateHour}' just before '.json' to save file with date and hour

      function finished(err) {

        console.log(`\n${dateTime}: Raw API Data Sucessfully Updated. Now editing file contents...`); // Callback to Api function and logs the time of a successful completion
        editFile( currentApiData, currentApiData );
        console.log( `\n${dateTime}: File successfully edited.`);

      }

    }catch(err) {

      console.log(`${dateTime}: The following error occured while updating th Api Data: ${err}`); // Prints error time and detail to console, if error occurs 
    
    };
  });
};

refreshApiData(); // Optional: Used to refresh localised Api data on boot. 

module.exports = refreshApiData; // Exportable module