const userSchema = require('../user/user.model');
const jwt = require('jsonwebtoken');
const config = require('../../config').config();

async function loginUser (email, password) {
    try {
        if (!(email && password)) {
            throw {
                status: 400,
                message: 'email and password is required'
            }
        }
        const user = await userSchema.findOne({ email: email, password: password });
 
        if (user && user.password === password) {
            const token = jwt.sign({ user_id: user._id, my_reffer_code: user.my_reffer_code }, config.jwtSecretKey, { expiresIn: config.jwtExpiresIn });
            user.token = token;
            user.save();
            return user;
        } 
        
        throw {
            status: 401,
            message: 'invalid credential'
        }
    } catch(error) {
        console.log('LOGIN_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

module.exports = { loginUser };