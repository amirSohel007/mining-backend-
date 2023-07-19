const mongoose = require('mongoose');
const moment = require('moment-timezone');
moment.tz('Asia/Kolkata');

// define a schema
const Schema = mongoose.Schema;

// define user schema
const FundTransactionSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, require: true, ref: 'user' },
    amount: { type: Number, require: true },
    transaction_no: { type: String },
    transaction_no: { type: String },
    receipt: { type: String },
    transaction_type: { type: String },
    received_from: { type: Schema.Types.ObjectId, ref: 'user' },
    sent_to: { type: Schema.Types.ObjectId, ref: 'user' },
    status: { type: String, required: true },
    user_fund: { type: Schema.Types.ObjectId, require: true, ref: 'userfund' },
    fund_receipt: { type: String },
    created_at: { type: Date, require: true, default: moment() },
    updated_at: { type: Date, require: true, default: moment() }
});

FundTransactionSchema.index({ user_id: 1, _id: 1, user_fund: 1 }, { unique: true })

const fundTransactionSchema = mongoose.model('fundtransaction', FundTransactionSchema)
module.exports = fundTransactionSchema;