const userSchema = require('./user.model');

async function getUserDetails (user_id) {
    try {
        const res = await userSchema.findOne({ _id: user_id })
        .populate({ path: 'bankdetail', strictPopulate: false });
        return res;
    } catch(error) {
        console.error(error)
        return {
            status: 401,
            message: error
        }
    }
}

async function updateUserDeatils (user_id, data) {
    try {
        const res = await userSchema.findOneAndUpdate({ _id: user_id }, data, { returnOriginal: false });
        return res;
    } catch(error) {
        console.error(error)
        return {
            status: 401,
            message: error
        }
    }
}

module.exports = { getUserDetails, updateUserDeatils };