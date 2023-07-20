const mongoose = require('mongoose');
const moment = require('moment-timezone');

// define a schema
const Schema = mongoose.Schema;

// define user schema
const CoinTransactionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, require: true, ref: 'user' },
    coin_wallet: { type: Schema.Types.ObjectId, ref: 'coin_wallet' },
    subscription: { type: Schema.Types.ObjectId, ref: 'subscription_plan' },
    transaction_type: { type: String, require: true },
    coin: { type: Number, default: 0.0 },
    created_at: { type: Date, require: true, default: moment().tz('Asia/Kolkata') },
    updated_at: { type: Date, require: true, default: moment().tz('Asia/Kolkata') }
});

CoinTransactionSchema.index({ user_id: 1, _id: 1 }, { unique: true })

const coinTransactionSchema = mongoose.model('coin_transaction', CoinTransactionSchema);
module.exports = coinTransactionSchema;