const mongoose = require('mongoose');
const moment = require('moment-timezone');

// define a schema
const Schema = mongoose.Schema;

// define user schema
const CoinWalletSchema = new Schema({
    user: { type: Schema.Types.ObjectId, require: true, ref: 'user' },
    coin_balance: { type: String, require: true, default: "0.0" },
    coin_subscription: [{ type: Schema.Types.ObjectId, ref: 'subscription_coin' }],
    // created_at: { type: Date, require: true, default: new moment().utc() },
    // updated_at: { type: Date, require: true, default: new moment().utc() }
}, {timestamps: true});

CoinWalletSchema.index({ user_id: 1, _id: 1 }, { unique: true })

const coinWalletSchema = mongoose.model('coin_wallet', CoinWalletSchema);
module.exports = coinWalletSchema;