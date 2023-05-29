const mongoose = require('mongoose');

// define a schema
const Schema = mongoose.Schema;

// define user schema
const UserFundSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, require: true, ref: 'user' },
    fund_balance: { type: Number, require: true },
    fund_transaction: [{ type: Schema.Types.ObjectId, ref: 'fundtransaction' }]
});

UserFundSchema.index({ user_id: 1, _id: 1 }, { unique: true })

const userFundSchema = mongoose.model('userfund', UserFundSchema);
module.exports = userFundSchema;