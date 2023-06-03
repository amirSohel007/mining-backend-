const mongoose = require('mongoose');

// define a schema
const Schema = mongoose.Schema;

// define income schema
const UserIncomeSchema = new Schema({
    balance: { type: Number, default: 0.0 },
    first_withdrawal: { type: Boolean, default: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'user' },
    transaction: [{ type: Schema.Types.ObjectId, ref: 'incometransaction' }],
    created_at: { type: Date, require: true, default: Date.now() },
    updated_at: { type: Date, require: true, default: Date.now() }
});

UserIncomeSchema.index({ user_id: 1, _id: 1 }, { unique: true });

const userIncomeSchema = mongoose.model('userincome', UserIncomeSchema)
module.exports = userIncomeSchema;