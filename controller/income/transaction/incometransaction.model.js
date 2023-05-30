const mongoose = require('mongoose');

// define a schema
const Schema = mongoose.Schema;

// define income transaction schema
const IncomeTransactionSchema = new Schema({
    amount: { type: Number, default: 0.0, require: true },
    status: { type: String, require: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'user', require: true }
});

IncomeTransactionSchema.index({ user_id: 1, _id: 1 }, { unique: true });

const incomeTransactionSchema = mongoose.model('incometransaction', IncomeTransactionSchema)
module.exports = incomeTransactionSchema;