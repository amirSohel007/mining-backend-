const express = require('express');
const app = express();
const connectDB = require('./connection/connection')
const bodyParser = require('body-parser');
const config = require('./config').config();

// defining port, if one is not available then port will be 3000
const port = process.env.PORT || 3001;

//  pasrse body to json and add body to request
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Add headers
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});



// connect mongodb
connectDB();

// initilizating routing
require('./routing').route(app);

app.get("/", (req, res) => {
  res.send("API IS UP AND RUNNING");
});

// creating server
app.listen(port);
console.log(`Server has been started on port : ${port}`);


// unhandled error
process.on('uncaughtException', (err) => {
    console.log(`uncaughtException : ${err}`);
});