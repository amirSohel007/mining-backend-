const mongoose = require('mongoose');
const moment = require('moment');

// define a schema
const Schema = mongoose.Schema;

// define user schema
const CoinWalletSchema = new Schema({
    user: { type: Schema.Types.ObjectId, require: true, ref: 'user' },
    coin_balance: { type: Number, require: true, default: 0.0 },
    coin_transaction: [{ type: Schema.Types.ObjectId, ref: 'coin_transaction' }],
    next_mining: { type: Date, require: true },
    created_at: { type: Date, require: true, default: moment() },
    updated_at: { type: Date, require: true, default: moment() }
});

CoinWalletSchema.index({ user_id: 1, _id: 1 }, { unique: true })

const coinWalletSchema = mongoose.model('coin_wallet', CoinWalletSchema);
module.exports = coinWalletSchema;