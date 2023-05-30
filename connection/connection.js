const mongoose = require("mongoose");
const connect = mongoose.connect;

//Connect databse
async function connectDB() {
  await connect(
    "mongodb+srv://admin:admin@cluster0.lhwqg4z.mongodb.net/?retryWrites=true&w=majority"
  );

 
  console.log("Connected to MongoDB");
}

module.exports = connectDB;
