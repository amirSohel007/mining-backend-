const mongoose = require("mongoose");
const connect = mongoose.connect;
const config = require('../config').config();

//Connect databse
async function connectDB() {
  await connect(
    config.db.mongo
  );

 
  console.log("Connected to MongoDB");
}

module.exports = connectDB;
