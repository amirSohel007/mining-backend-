const mongoose = require('mongoose');
const moment = require('moment-timezone');

// define a schema
const Schema = mongoose.Schema;

// define direct income schema
const DirectIncomeSchema = new Schema({
    plan: { type: Schema.Types.ObjectId, ref: 'subscription_plan', require: true },
    user: { type: Schema.Types.ObjectId, ref: 'user', require: true },
    income_from_user: { type: Schema.Types.ObjectId, ref: 'user', require: true },
    subscription_transaction: { type: Schema.Types.ObjectId, ref: 'subscription_transaction', require: true },
    complete_percent: { type: Number, default: 1 },
    is_completed: { type: Boolean, default: false },
    created_at : { type: Date, require: true, default: moment().tz('Asia/Kolkata') },
    updated_at : { type: Date, require: true, default: moment().tz('Asia/Kolkata') }
});

DirectIncomeSchema.index({ user: 1, plan: 1, income_from_user: 1, is_completed: 1, _id: 1 }, { unique: true });

const directIncomeSchema = mongoose.model('direct_income', DirectIncomeSchema);
module.exports = directIncomeSchema;