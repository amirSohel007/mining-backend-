const userSchema = require('../user/user.model');

async function loginUser (email, password) {
    try {
        const res = await userSchema.findOne({ email: email, password: password })
        .populate({ path: 'bank_detail' });
        return res;
    } catch(error) {
        console.error(error)
        return {
            status: 401,
            message: error
        }
    }
}

module.exports = { loginUser };