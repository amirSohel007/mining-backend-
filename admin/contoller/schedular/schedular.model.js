const mongoose = require('mongoose');
const moment = require('moment-timezone');

// define schema
const Schema = mongoose.Schema;

//define schedular execution detail schema
const SchedularSchema = new Schema({
    counter: { type: Number, require: true, default: 0 },
    execution_date: { type: String, require: true },
}, {timestamps: true});

const schedularSchema = mongoose.model('schedular', SchedularSchema)
module.exports = schedularSchema;