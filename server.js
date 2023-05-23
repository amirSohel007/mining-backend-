const express = require('express');
const app = express();
const connectDB = require('./connection/connection')
const bodyParser = require('body-parser');
const config = require('./config').config();

// defining port, if one is not available then port will be 3000
const port = process.env.PORT || 3000;

//  pasrse body to json and add body to request
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(function (req, res, next) {
    if (config.allowedOrigins.indexOf(req.headers.origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    }

    // allowed http methods
    res.setHeader('Access-Control-Allow-Origin', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

    // allowed request headers 
    res.setHeader('Access-Control-Allow-Origin', 'content-type, Authorization, X-Requested-With');

    // headers security
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1, mode=block');

    next();
});

app.get('/check-health', (req, res) => {
    res.send('success');
});

// connect mongodb
connectDB();

// initilizating routing
// require('./routing').route(app);

// creating server
app.listen(port);
console.log(`Server has been started on port : ${port}`);


// unhandled error
process.on('uncaughtException', (err) => {
    console.log(`uncaughtException : ${err}`);
});