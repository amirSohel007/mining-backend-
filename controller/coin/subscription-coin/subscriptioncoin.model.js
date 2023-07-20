const mongoose = require('mongoose');
const moment = require('moment-timezone');

// define a schema
const Schema = mongoose.Schema;

// define user schema
const SubscriptionCoinSchema = new Schema({
    user: { type: Schema.Types.ObjectId, require: true, ref: 'user' },
    coin_wallet: { type: Schema.Types.ObjectId, ref: 'coin_wallet' },
    subscription: { type: Schema.Types.ObjectId, ref: 'subscription_plan' },
    coin_transaction: [{ type: Schema.Types.ObjectId, ref: 'coin_transaction' }],
    next_mining: { type: Date },
    created_at: { type: Date, require: true, default: moment().tz('Asia/Kolkata') },
    updated_at: { type: Date, require: true, default: moment().tz('Asia/Kolkata') }
});

SubscriptionCoinSchema.index({ user_id: 1, _id: 1 }, { unique: true })

const subscriptionCoinSchema = mongoose.model('subscription_coin', SubscriptionCoinSchema);
module.exports = subscriptionCoinSchema;