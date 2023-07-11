const mongoose = require('mongoose');

// define a schema
const Schema = mongoose.Schema;

// define direct income schema
const LevelIncomeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user', require: true },
    income_from_user: { type: Schema.Types.ObjectId, ref: 'user', require: true },
    subscription_transaction: { type: Schema.Types.ObjectId, ref: 'subscription_transaction', require: true },
    created_at : { type: Date, require: true, default: Date.now() },
    updated_at : { type: Date, require: true, default: Date.now() }
});

LevelIncomeSchema.index({ user: 1, income_from_user: 1, _id: 1 }, { unique: true });

const levelIncomeSchema = mongoose.model('level_income', LevelIncomeSchema);
module.exports = levelIncomeSchema;