const mongoose = require('mongoose');
const { UserFundStatus } = require('../../../commonHelper');
const moment = require('moment-timezone');

// define a schema
const Schema = mongoose.Schema;

// define income transaction schema
const IncomeTransactionSchema = new Schema({
    amount: { type: Number, default: 0.0, require: true },
    payment_type: { type: String },
    bank_ref_no: { type: String },
    client_id: { type: String },
    transaction_id: { type: String },
    paid_amount:{type:Number},
    status: { type: String, require: true , default: UserFundStatus.PENDING},
    user_id: { type: Schema.Types.ObjectId, ref: 'user', require: true },
    // created_at: { type: Date, require: true, default: new moment().utc() },
    // updated_at: { type: Date, require: true, default: new moment().utc() }
    
}, {timestamps: true});

IncomeTransactionSchema.index({ user_id: 1, _id: 1 }, { unique: true });

const incomeTransactionSchema = mongoose.model('incometransaction', IncomeTransactionSchema)
module.exports = incomeTransactionSchema;