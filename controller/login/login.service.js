const userSchema = require('../user/user.model');
const jwt = require('jsonwebtoken');

async function loginUser (email, password) {
    try {
        if (!(email && password)) {
            throw {
                status: 400,
                message: 'email and password is required'
            }
        }
        const user = await userSchema.findOne({ email: email, password: password })
        .populate({ path: 'bank_detail' });

        if (user && user.password === password) {
            const token = jwt.sign({ user_id: user._id }, 'thisissecretkey', { expiresIn: '1m' });
            user.token = token;
            user.save();
            return user;
        } 
        
        throw {
            status: 401,
            message: error
        }
    } catch(error) {
        console.log('LOGIN_ERROR : ', error);
        throw {
            status: 500,
            message: error
        }
    }
}

module.exports = { loginUser };