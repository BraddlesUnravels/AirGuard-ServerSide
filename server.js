const { application } = require( 'express' );
const express = require( 'express' );
const app = express();
const logEvents = require( './functions/logEvents' );
const EventEmitter = require( 'events' );
class Emitter extends EventEmitter { };
const bodyParser = require( 'body-parser' );
const path = require( 'path' );
const PORT = process.env.PORT || 3500; //Set port for server
const fs = require( 'fs' );
const { format, eachMonthOfInterval } = require('date-fns');
const refreshApiData = require( './api/refreshApiData' );
const schedule = require( 'node-schedule' ); // Use this when building the daily DB dumb to mongoDB
const date = new Date();
const cors = require( 'cors' );
const { UUID } = require( 'bson' );
const genID = require( './functions/genID' );
const nodemailer = require( 'nodemailer' );
const creds = require( './configurations/keys' );

app.use(cors());
app.use(bodyParser.json()); // Parse application/json

// Set and format dateTime interval 1800000
const dateTime = `${ format( new Date(), 'ddMMyyy\tHH:mm:ss' )}`;
const connMong = `mongodb+srv://blask:blankvoid2020@airmon-vic.loqkv.mongodb.net/AIRMON_DB?retryWrites=true&w=majority`; //MongoDB connection string
const logEmitter = new Emitter();
logEmitter.on( 'log', ( msg, fileName ) => logEvents( msg, fileName )); //Listener

//Api call interval
setInterval( refreshApiData, 1800000 );


// SERVER PAGE AND FILE DELIVERY BEGINS BELOW.

app.get( '^/$|/home(.html)?', ( req, res ) => { 
  
  res.sendFile( path.join( __dirname, 'pageDirectory', 'home.html' ));

});

app.get( '^/$|currentApiData(.json)?', ( req, res ) => {
 
  res.sendFile( path.join( __dirname, 'database/airQualityReadings', 'currentApiData.json' ));
  console.log( 'AirGuard connection successful' );

});

app.get( '^/$|style(.css)?', ( req, res ) => { 

  res.sendFile( path.join( __dirname, 'pageDirectory', 'style.css' ));

});

app.post( "/register", ( req, res ) => {

  const regData = JSON.stringify( req.body, null, 2 );
  const RegistrationID = genID( 100000, 999999 );
  const earlyRegistration = `./database/earlyRegistration/AGR-${ RegistrationID }.json`;
  
  try {
    
    console.log( regData )
    fs.writeFile( earlyRegistration, regData, function ( err ) {
      
      if ( err ) {
      
        console.log( `\n${ dateTime } An error occured saving registration data: ${ err }` );
        res.sendStatus( 500 );
      
      } else {
      
        console.log( `${ dateTime } New registration saved` )
        res.sendStatus( 200 )
      } 
    });
  
  } catch ( err ) {
     
    console.log( `${ dateTime } Error occured while receiving a new registration: ${ err }` );
    
  };
});


// Below code is for the NodeMailer, currently linked with the contact us part of the front end
var transport = {
  
  host: 'smtp.gmail.com', // e.g. smtp.gmail.com
  auth: {
    
    user: creds.USER,
    pass: creds.PASS
  
  }
};

var transporter = nodemailer.createTransport(transport)

transporter.verify((error, success) => {
  
  if (error) {
  
    console.log(`\n${ dateTime } An error occured starting NodeMailer service: ${ error }` );
  
  } else {
  
    console.log( `\n${ dateTime } NodeMailer transporter successfully booted` );
  
  };
});

// Below uses NodeMaler to recieve a post request from the react webpage. Then logs into googles smtp servers and emails the details to the selected email.
app.use(express.json()); app.post('/Contact', (req, res, next) => {
  
  const id = req.body.id
  const name = req.body.Name
  const phone = req.body.Phone
  const email = req.body.Email
  const message = req.body.Message


  var mail = {
    
    to: 'bradley@b-laskey.com', // This should be moved to the config file
    subject: `MessageID: ${id}`,

    html: `Contact Name: ${ name },
           Phone: ${ phone }, 
           Email: ${ email }, 
           Message: ${ message }`
  };
  
  try {
    
    transporter.sendMail(mail)
    res.sendStatus( 200 );
    console.log( `\nNew Contact Request Recieved and Emailed at: ${ dateTime }` );
  
  } catch ( err ) {
  
    console.log( `${ dateTime } Error occured while receiving a new contcat request: ${ err }` );
    res.statusCode( 500 );
  
  };
});


console.log(`\nYou have successfully launched Server Side AirGuard Beta 0.0.5 \n\nLaunch time: ${dateTime}`);

app.listen(PORT, () => console.log(`\nServer running on port ${PORT}`));

// Server Notes
// The ^ means 'must start with' the $ means end with' and the | is an or the request may be x. The '(.html)?' Makes the extention optional.
// One way to serve file - res.sendFile('./views/index.html, { root: __dirname }); 