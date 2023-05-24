const mongoose = require('mongoose');

// define a schema
const Schema = mongoose.Schema;

// define user schema
const UserSchema = new Schema({
    my_reffer_code: {type: String, require: true, unique: true },
    email: {type: String, require: true, unique: true },
    password: {type: String, require: true },
    sponser_id: {type: String, require: false }
});

UserSchema.index({ my_reffer_code: 1, _id: 1 }, { unique: true })

const userSchema = mongoose.model('user', UserSchema)
module.exports = userSchema;