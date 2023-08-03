const mongoose = require('mongoose');
const moment = require('moment-timezone');

// define schema
const Schema = mongoose.Schema;

//define boosting income schema
const BoostIncomeSchema = new Schema({
    duration_hours: { type: Number, require: true },
    direct_team_count: { type: Number, require: true },
    extra_income_percentage: { type: Number, require: true },
    // created_at: { type: Date, require: true, default: new moment().utc() },
    created_by: { type: Schema.Types.ObjectId, ref: 'user' },
    // updated_at: { type: Date, require: true, default: new moment().utc() },
    updated_by: { type: Schema.Types.ObjectId, ref: 'user' },
}, {timestamps: true});

const boostIncomeSchema = mongoose.model('boost_income', BoostIncomeSchema)
module.exports = boostIncomeSchema;