const mongoose = require('mongoose');
const { Status, UserRole } = require('../../commonHelper');
const moment = require('moment-timezone');
moment.tz('Asia/Kolkata');

// define a schema
const Schema = mongoose.Schema;

// define user schema
const UserSchema = new Schema({
    my_reffer_code: { type: String, require: true, unique: true },
    full_name: { type: String, required: true },
    email: { type: String, require: true},
    password: { type: String, require: true },
    sponser_id: { type: String, require: false },
    phone: { type: String, require: true },
    token: { type: String },
    bank_detail: { type: Schema.Types.ObjectId, ref: 'bankdetail' },
    downline_team: [{ type: Schema.Types.ObjectId, ref: 'user', default: [] }],
    direct_team_size: { type: Number, default: 0 }, 
    income: { type: Schema.Types.ObjectId, ref: 'userincome' },
    joining_date : { type: Date, require: true, default: moment() },
    status : { type: String, require: true, default: Status.INACTIVE },
    is_eligibale_for_time_reward: { type: Boolean, default: true },
    is_eligibale_for_extra_income: { type: Boolean, default: false },
    role: { type: Number, require: true, default: UserRole.USER },
    created_at : { type: Date, require: true, default: moment() },
    updated_at : { type: Date, require: true, default: moment() }
});

UserSchema.index({ my_reffer_code: 1, _id: 1 }, { unique: true });

function autoPopulateTeam (next) {
    this.populate('downline_team');
    next();
}

UserSchema.pre('find', autoPopulateTeam);


const userSchema = mongoose.model('user', UserSchema)
module.exports = userSchema;