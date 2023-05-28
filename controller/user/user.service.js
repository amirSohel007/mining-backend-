const userSchema = require('./user.model');

async function getUserDetailsWithPopulatedData (user_id, table_name) {
    try {
        const res = await userSchema.findOne({ _id: user_id })
        .populate({ path: table_name, strictPopulate: false });
        return res;
    } catch(error) {
        console.log('GET_USER_DETAILS : ', error);
        throw {
            status: error.status || 500,
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
            status: error.status || 500,
            message: error
        }
    }
}

async function getUserInfo (user_id) {
    try {
        const result = await userSchema.findOne({ _id: user_id }, { token: 0 });
        if (result) {
            return result;
        }
        return { 
            message: 'record not found'
        }
    } catch(error) {
        console.log('GET_USER_DETAILS : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

module.exports = { getUserDetailsWithPopulatedData, updateUserDetails, getUserInfo };