const mongoose = require('mongoose');
const moment = require('moment-timezone');

// define schema
const Schema = mongoose.Schema;

//define other income and rewards schema
const IncomeRewardSchema = new Schema({
    direct_income_instant_percent: { type: Number, default: 0 },
    direct_income_daily_percent: { type: Number, default: 0 },
    all_subscription_active_time: { type: Number, default: 0 },
    all_subscription_instant_bonus: { type: Number, default: 0.0 },
    all_subscription_per_day_income: { type: Number, default: 0.0 },
    team_reward_instant_bonus: { type: Number, default: 0.0 },
    created_at: { type: Date, require: true, default: new moment().utc() },
    created_by: { type: Schema.Types.ObjectId, ref: 'user' },
    updated_at: { type: Date, require: true, default: new moment().utc() },
    updated_by: { type: Schema.Types.ObjectId, ref: 'user' },
});

const incomeRewardSchema = mongoose.model('income_reward', IncomeRewardSchema)
module.exports = incomeRewardSchema;