const userSchema = require('../user/user.model');

async function changePassword (user_id, old_password, new_password) {
    try {
        const userDetail = await userSchema.findOne({ _id: user_id });
        if (userDetail) {
            if (userDetail.password === old_password) {
                userDetail.password = new_password;
                userDetail.save();
                return { message: 'password updated' };
            }
            throw {
                status: 400,
                message: 'old password is not matching'
            }
        }
        return {
            message: 'user not found, unable to update'
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