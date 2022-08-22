var fs = require('fs'),
    obj

// Read the file and send to the callback
fs.readFile('database/currentApiData.json', handleFile)

// Write the callback function
function handleFile(err, data) {
    if (err) throw err
    obj = JSON.parse(data)
    // You can now play with your datas
}

console.log(data)