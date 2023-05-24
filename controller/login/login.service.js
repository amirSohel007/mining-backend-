const userSchema = require('../user/user.model');

async function loginUser (email, password) {
    try {
        const res = await userSchema.find({ email: email, password: password });
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