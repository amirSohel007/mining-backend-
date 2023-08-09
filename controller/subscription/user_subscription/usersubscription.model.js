const mongoose = require('mongoose');
const { Status, UserRole } = require('../../../commonHelper');
const moment = require('moment-timezone');

// define a schema
const Schema = mongoose.Schema;

// define user schema
const UserSubscriptionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    plan: { type: Schema.Types.ObjectId, ref: 'subscription_plan' },
    next_daily_income: { type: Date, require: true },
    active: { type: Boolean, default: true },
    // created_at: { type: Date, require: true, default: new moment().utc() },
    // updated_at: { type: Date, require: true, default: new moment().utc() }
}, {timestamps: true});

UserSubscriptionSchema.index({ _id: 1, user: 1, plan: 1 }, { unique: true });

const userSubscriptionSchema = mongoose.model('usersubscription', UserSubscriptionSchema)
module.exports = userSubscriptionSchema;