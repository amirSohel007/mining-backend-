const mongoose = require('mongoose');
const moment = require('moment-timezone');

// define a schema
const Schema = mongoose.Schema;

// define direct income schema
const LevelIncomeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user', require: true },
    income_from_user: { type: Schema.Types.ObjectId, ref: 'user', require: true },
    child_user_level: { type: Number, default: 1 },
    subscription_transaction: { type: Schema.Types.ObjectId, ref: 'subscription_transaction', require: true },
    created_at : { type: Date, require: true, default: new moment().utc() },
    updated_at : { type: Date, require: true, default: new moment().utc() }
});

LevelIncomeSchema.index({ user: 1, income_from_user: 1, _id: 1 }, { unique: true });

const levelIncomeSchema = mongoose.model('level_income', LevelIncomeSchema);
module.exports = levelIncomeSchema;