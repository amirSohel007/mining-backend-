const mongoose = require('mongoose');

// define a schema
const Schema = mongoose.Schema;

// define user schema
const UserFundSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, require: true, ref: 'user' },
    fund_balance: { type: Number, require: true, default: 0.0 },
    fund_transaction: [{ type: Schema.Types.ObjectId, ref: 'fundtransaction' }],
    created_at: { type: Date, require: true, default: Date.now() },
    updated_at: { type: Date, require: true, default: Date.now() }
});

UserFundSchema.index({ user_id: 1, _id: 1 }, { unique: true })

const userFundSchema = mongoose.model('userfund', UserFundSchema);
module.exports = userFundSchema;