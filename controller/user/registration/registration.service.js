const userSchema = require('../user.model');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const config = require('../../../config').config();

async function createUser (data) {
    try {
        if (data) {
            // check if user exist in db
            // const existingUser = await userSchema.findOne({ email: data.email });
            // if (existingUser) {
            //     throw {
            //         status: 409,
            //         message: 'user already exist'
            //     }
            // }

            // generate refer code
            let myRefferCode = ''
            if (data.full_name) {
                let randomNumber = crypto.randomInt(0, 1000000);
                randomNumber = randomNumber.toString().padStart(4, "0");
                // let name = data.full_name.length > 3 ? data.full_name.slice(0, 3) : data.full_name.slice(data.full_name.length);
                let name = 'MDEX'
                name = name.toUpperCase();
                myRefferCode = `${name}${randomNumber}`;
                data['my_reffer_code'] = myRefferCode;
            }

            // adding user to his parent user based on sponser id
            let user;
            if (data.sponser_id) {
                const sponser_user = await userSchema.findOne({ my_reffer_code: data.sponser_id });
                if (sponser_user) {
                    user = await userSchema.create(data);
                    sponser_user.downline_team.push(user._id);
                    sponser_user.direct_team_size += 1; 
                    await sponser_user.save();
                } else {
                    console.log('SPONSER_ID_NOT FOUND : ', data.sponser_id);
                    throw {
                        status: 400,
                        message: 'Invalid sponser id'
                    }
                }
            } else {
                user = await userSchema.create(data);
            }

            // adding token 
            const token = jwt.sign({ user_id: user._id, my_reffer_code: user.my_reffer_code }, config.jwtSecretKey, { expiresIn: config.jwtExpiresIn });
            user.token = token;
            await user.save();
            return user;
        }
    } catch(error) {
        console.log('CREAT_USER : ', error)
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

module.exports = { createUser };