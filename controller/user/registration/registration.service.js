const userSchema = require('../user.model');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');

async function createUser (data) {
    try {
        if (data && data.full_name) {
            const existingUser = await userSchema.findOne({ email: data.email });
            if (existingUser) {
                throw {
                    status: 409,
                    message: 'user already exist'
                }
            }

            let myRefferCode = ''
            if (data.full_name) {
                let randomNumber = crypto.randomInt(0, 1000000);
                randomNumber = randomNumber.toString().padStart(4, "0");
                let name = data.full_name.length > 3 ? data.full_name.slice(0, 3) : data.full_name.slice(data.full_name.length);
                name = name.toUpperCase();
                myRefferCode = `${name}${randomNumber}`;
                data['my_reffer_code'] = myRefferCode;
            }
            const user = await userSchema.create(data);
            const token = jwt.sign({ user_id: user._id }, 'thisissecretkey', { expiresIn: '1m' });
            user.token = token;
            user.save();
            return user;
        }
    } catch(error) {
        console.log('CREAT_USER : ', error)
        throw {
            status: 500,
            message: error
        }
    }
}

module.exports = { createUser };