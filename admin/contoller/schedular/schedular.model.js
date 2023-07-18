const mongoose = require('mongoose');
const moment = require('moment');

// define schema
const Schema = mongoose.Schema;

//define schedular execution detail schema
const SchedularSchema = new Schema({
    counter: { type: Number, require: true, default: 0 },
    last_executed: { type: String, require: true },
    is_executed_today: { type: Boolean, require: true, default: false },
    created_at: { type: Date, require: true, default: moment().utcOffset("+05:30").format() },
    updated_at: { type: Date, require: true, default: moment().utcOffset("+05:30").format() },
});

const schedularSchema = mongoose.model('schedular', SchedularSchema)
module.exports = schedularSchema;