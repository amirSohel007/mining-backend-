const mongoose = require('mongoose');
const config = require('../config').config();

const connectDB = async () => {
    try {
      console.log('CONFIG : ', config.db);
      const conn = await mongoose.connect(config.db.mongo, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.log('MONGO_DB_CONNECTION_ERROR : ', error);
      console.error(error.message);
      process.exit(1);
    }
  }

  module.exports = connectDB;