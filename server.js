const express = require('express');
const app = express();
const connectDB = require('./connection/connection')
const bodyParser = require('body-parser');
const cors = require("cors");
require("dotenv").config();
const { deleteAllDirectoryFiles, createUploadFolder } = require('./commonHelper');
const { getAllSubscribers, creditDailyDirectIncome } = require('./admin/contoller/subscription/subscription.service');
const { calculateBoostingIncome } = require('./controller/subscription/boost_income/boost_income.service');
const { levelIncome } = require('./controller/user/user.service');
// const scheduler = require('node-schedule-tz');
const { checkSchedulerTrigger } = require('./admin/contoller/schedular/schedular.service');

// defining port, if one is not available then port will be 3000
const port = process.env.NODE_PORT || 5000;

//  pasrse body to json and add body to request
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: "10mb", extended: true }));
app.use(
  express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 })
);

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


//
const nodeCron = require('node-cron');

const job = nodeCron.schedule("0 1 * * *", async () => {
  console.log(`Scheduler has been triggred at ${new Date().toLocaleString()}`);
  try {

    const run = await checkSchedulerTrigger();
    if (run) {
      console.log('SCHEDULAR IS RUNNING AT 1:00 AM');
      await getAllSubscribers();
      await creditDailyDirectIncome();
      await calculateBoostingIncome();
      await levelIncome();
    } else {
      console.log('SCHEDULAR RE-RUN CAUGHT.....');
    }
  } catch (error) {
    console.log('SCHEDULAR_ERROR : ', error);
  }
}, { timezone: 'Asia/Kolkata' });




// start a cron job to credit daily income to user
// const rule = new scheduler.RecurrenceRule();
// rule.hour = 16;
// rule.minute = 51;
// rule.tz = 'Asia/Kolkata';

// scheduler.scheduleJob(rule, async function() {
  // try {
  //   const run = await logSchedularActivity();
  //   if (run) {
  //     console.log('SCHEDULAR IS RUNNING AT 1:01 AM');
  //     // await getAllSubscribers();
  //     // await creditDailyDirectIncome();
  //     // await calculateBoostingIncome();
  //     // await levelIncome();
  //   } else {
  //     console.log('SCHEDULAR IS RUNNING AT 1:01 AM ELSE');
  //   }
  // } catch (error) {
  //   console.log('SCHEDULAR_ERROR : ', error);
  // }
// });

// unhandled error
process.on('uncaughtException', (err) => {
    console.log(`uncaughtException : ${err}`);
});
