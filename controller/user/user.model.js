const mongoose = require('mongoose');
const { Status } = require('../../commonHelper');

// define a schema
const Schema = mongoose.Schema;

// define user schema
const UserSchema = new Schema({
    my_reffer_code: { type: String, require: true, unique: true },
    full_name: { type: String, required: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    sponser_id: { type: String, require: false },
    phone: { type: String, require: true },
    token: { type: String },
    bank_detail: { type: Schema.Types.ObjectId, ref: 'bankdetail' },
    downline_team: [{ type: Schema.Types.ObjectId, ref: 'user', default: [] }],
    income: { type: Schema.Types.ObjectId, ref: 'userincome' },
    joining_date : { type: Date, require: true, default: Date.now() },
    status : { type: String, require: true, default: Status.InActive },
    created_at : { type: Date, require: true, default: Date.now() },
    updated_at : { type: Date, require: true }
});

UserSchema.index({ my_reffer_code: 1, _id: 1 }, { unique: true });
UserSchema.virtual('direct_user_count').get(function() {
    return this.downline_team.length;
});
UserSchema.virtual('down_user_count').get(function() {
    return this.downline_team.length;
});


const userSchema = mongoose.model('user', UserSchema)
module.exports = userSchema;