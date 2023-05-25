const userSchema = require('./user.model');

async function getUserDetails (user_id) {
    try {
        const res = await userSchema.findOne({ _id: user_id })
        .populate({ path: 'bankdetail', strictPopulate: false });
        return res;
    } catch(error) {
        console.log('GET_USER_DETAILS : ', error);
        throw {
            status: 500,
            message: error
        }
    }
}

async function updateUserDetails (user_id, data) {
    try {
        const res = await userSchema.findOneAndUpdate({ _id: user_id }, data, { returnOriginal: false });
        return res;
    } catch(error) {
        console.log('UPDATE_USER_DETAILS : ', error);
        throw {
            status: 500,
            message: error
        }
    }
}

module.exports = { getUserDetails, updateUserDetails };