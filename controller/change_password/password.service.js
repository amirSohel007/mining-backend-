const userSchema = require('../user/user.model');

async function changePassword (user_id, old_password, new_password) {
    try {
        const userDetail = await userSchema.findOne({ _id: user_id });
        if (userDetail) {
            if (userDetail.password === old_password) {
                userDetail.password = new_password;
                await userDetail.save();
                return { message: 'Password updated' };
            }
            throw {
                status: 400,
                message: 'Old password is not matching'
            }
        }
        return {
            message: 'User not found, unable to update'
        }
    } catch(error) {
        console.log('CHANGE_PASSWORD : ', error)
        throw {
            status: error.status || 400,
            message: error
        }
    }
}

module.exports = { changePassword };