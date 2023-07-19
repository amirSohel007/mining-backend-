const mongoose = require('mongoose');
const moment = require('moment-timezone');
moment.tz('Asia/Kolkata');

// define schema
const Schema = mongoose.Schema;

//define boosting income schema
const BoostIncomeSchema = new Schema({
    duration_hours: { type: Number, require: true },
    direct_team_count: { type: Number, require: true },
    extra_income_percentage: { type: Number, require: true },
    created_at: { type: Date, require: true, default: moment() },
    created_by: { type: Schema.Types.ObjectId, ref: 'user' },
    updated_at: { type: Date, require: true, default: moment() },
    updated_by: { type: Schema.Types.ObjectId, ref: 'user' },
});

const boostIncomeSchema = mongoose.model('boost_income', BoostIncomeSchema)
module.exports = boostIncomeSchema;