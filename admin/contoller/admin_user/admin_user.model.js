const mongoose = require('mongoose');
const { UserRole } = require('../../../commonHelper');
const moment = require('moment-timezone');

// define a schema
const Schema = mongoose.Schema;
const SchemaTypes = mongoose.Schema.Types;
// define user schema
const AdminUserSchema = new Schema({
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    token: { type: String },
    role: { type: Number, require: true, default: UserRole.ADMIN },
    qr:{ type: String },
    totalFund:{type:SchemaTypes.Mixed,default: 0.00},
    totalWithdrawal:{type:SchemaTypes.Mixed,default: 0.00},
    joining_date : {type: Date,require: true, default : new moment().utc() },
    created_at : {type: Date,require: true,default : new moment().utc() },
    updated_at : {type: Date,require: true,default : new moment().utc() },

});

const adminUserSchema = mongoose.model('AdminUser', AdminUserSchema)
module.exports = adminUserSchema;