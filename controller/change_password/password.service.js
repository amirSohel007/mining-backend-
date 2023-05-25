const userSchema = require('../user/user.model');

async function changePassword (user_id, old_password, new_password) {
    try {
        const res = await userSchema.findOneAndUpdate({ _id: user_id, password: old_password }, { password: new_password }, { returnOriginal: false });
        return { message: 'password updated' };
    } catch(error) {
        console.error(error)
        return {
            status: 400,
            message: error
        }
    }
}

module.exports = { changePassword };