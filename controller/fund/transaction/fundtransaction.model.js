const mongoose = require('mongoose');

// define a schema
const Schema = mongoose.Schema;

// define user schema
const FundTransactionSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, require: true, ref: 'user' },
    amount: { type: Number, require: true },
    transaction_no: { type: String },
    receipt: { type: String },
    transaction_type: { type: String },
    received_from: { type: Schema.Types.ObjectId, ref: 'user' },
    sent_to: { type: Schema.Types.ObjectId, ref: 'user' },
    status: { type: String, required: true },
    user_fund: { type: Schema.Types.ObjectId, require: true, ref: 'userfund'}
});

FundTransactionSchema.index({ user_id: 1, _id: 1, user_fund: 1 }, { unique: true })

const fundTransactionSchema = mongoose.model('fundtransaction', FundTransactionSchema)
module.exports = fundTransactionSchema;