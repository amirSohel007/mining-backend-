const express = require('express');
const app = express();
const connectDB = require('./connection/connection')
const bodyParser = require('body-parser');
const cors = require("cors");
require("dotenv").config();
const { deleteAllDirectoryFiles, createUploadFolder } = require('./commonHelper');
const schedule = require('node-schedule');
const { getAllSubscribers, creditDailyDirectIncome } = require('./admin/contoller/subscription/subscription.service');

// defining port, if one is not available then port will be 3000
const port = process.env.NODE_PORT || 5000;

//  pasrse body to json and add body to request
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(cors({
  origin : '*'
}));

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  // headers security
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1, mode=block");
  next();
});

// delete all files from upload/payment-receipt-image folder in every 24 hours
// setInterval(() => {
//   console.log('CLEARING_UPLOAD_FOLDER_START');
//   deleteAllDirectoryFiles('uploads/payment-receipt-image');
//   console.log('CLEARING_UPLOAD_FOLDER_END');
// }, (1000 * 60 * 60 * 24));

// create upload folder on server startup
createUploadFolder(); 

app.use(express.static('uploads/'));

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

// start a cron job to credit daily income to user
schedule.scheduleJob('*/59 * * * *', function() {
  console.log('SCHEDULAR IS RUNNING AT EVERY 1 HOUR');
  getAllSubscribers();
  creditDailyDirectIncome();
});

// unhandled error
process.on('uncaughtException', (err) => {
    console.log(`uncaughtException : ${err}`);
});