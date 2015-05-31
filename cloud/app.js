/**
 * Created by Claude on 15. 5. 31..
 */
var express = require('express');
var app = express();



app.get('/sm_phone_verify', function(req, res) {


    console.log("dfg");
    res.set('Content-Type', 'text/plain');
    res.send('echoing: ' + req.body.message);
});


// This line is required to make Express respond to http requests.
app.listen();