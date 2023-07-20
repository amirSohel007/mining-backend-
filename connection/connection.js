const mongoose = require("mongoose");
const connect = mongoose.connect;

//Connect databse
async function connectDB() {
  await connect(
   'mongodb://127.0.0.1/mining'
  );

 
  console.log("Connected to MongoDB");
}

module.exports = connectDB;
