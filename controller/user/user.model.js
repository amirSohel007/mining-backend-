const mongoose = require('mongoose');
const { Status, UserRole } = require('../../commonHelper');

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
    status : { type: String, require: true, default: Status.INACTIVE },
    role: { type: Number, require: true, default: UserRole.USER },
    created_at : { type: Date, require: true, default: Date.now() },
    updated_at : { type: Date, require: true, default: Date.now() }
});

UserSchema.index({ my_reffer_code: 1, _id: 1 }, { unique: true });

function autoPopulateTeam (next) {
    this.populate('downline_team');
    next();
}

UserSchema.pre('find', autoPopulateTeam);


const userSchema = mongoose.model('user', UserSchema)
module.exports = userSchema;