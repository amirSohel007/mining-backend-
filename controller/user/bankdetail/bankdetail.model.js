const mongoose = require('mongoose');
const moment = require('moment-timezone');

// define a schema
const Schema = mongoose.Schema;

// define user schema
const BankDetailSchema = new Schema({
    bank_name: { type: String, require: true },
    account_number: {type: String, require: true },
    ifsc_code: {type: String, require: true },
    account_holder_name: {type: String, require: true },
    branch: {type: String, require: true },
    user_id: {type: Schema.Types.ObjectId, require: true, ref: 'user' },
    created_at: { type: Date, require: true, default: moment().tz('Asia/Kolkata') },
    updated_at: { type: Date, require: true, default: moment().tz('Asia/Kolkata') }
});

BankDetailSchema.index({ user_id: 1, _id: 1 }, { unique: true })

const bankDetailSchema = mongoose.model('bankdetail', BankDetailSchema)
module.exports = bankDetailSchema;