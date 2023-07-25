const mongoose = require('mongoose');
const { Status, UserRole } = require('../../../commonHelper');
const moment = require('moment-timezone');

// define a schema
const Schema = mongoose.Schema;

// define user schema
const SubscriptionTransactionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    user_subscription: { type: Schema.Types.ObjectId, ref: 'usersubscription' },
    amount: { type: Number, default: 0.0, require: true },
    income_type: { type: String, require: true },
    created_at: { type: Date, require: true, default: new moment().utc() },
    updated_at: { type: Date, require: true, default: new moment().utc() }
});

SubscriptionTransactionSchema.index({ _id: 1, user: 1, income_type: 1 }, { unique: true });

const subscriptionTransactionSchema = mongoose.model('subscription_transaction', SubscriptionTransactionSchema)
module.exports = subscriptionTransactionSchema;