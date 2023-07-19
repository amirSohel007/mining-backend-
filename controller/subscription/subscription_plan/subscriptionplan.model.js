const mongoose = require('mongoose');
const moment = require('moment-timezone');
moment.tz('Asia/Kolkata');

// define a schema
const Schema = mongoose.Schema;

// define user schema
const SubscriptionPlanSchema = new Schema({
  plan_title: { type: String, default: "" },
  plan_description: { type: String, default: "" },
  active: { type: Boolean, default: true },
  price: { type: Number, default: 0.0, require: true },
  daily_mining_coin: { type: Number, default: 0.0, require: true },
  created_at: { type: Date, require: true, default: moment() },
  created_by: { type: Schema.Types.ObjectId },
  updated_at: { type: Date, require: true, default: moment() },
  updated_by: { type: Schema.Types.ObjectId },
});

SubscriptionPlanSchema.index({ _id: 1, plan_title: 1 }, { unique: true });

const subscriptionPlanSchema = mongoose.model('subscription_plan', SubscriptionPlanSchema)
module.exports = subscriptionPlanSchema;