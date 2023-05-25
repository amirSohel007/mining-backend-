const bankDetailSchema = require('./bankdetail.model');
const { updateUserDeatils } = require('../user.service');

async function addBankDetail (data) {
    try {
        if (data && data.user_id !== null && data.user_id !== '') {
            const res = await bankDetailSchema.create(data);
            await updateUserDeatils(data.user_id, { bank_detail: res._id });
            return res;
        } else {
            return {
                status: 400,
                message: 'user id is missing'
            }    
        }
    } catch(error) {
        console.error(error)
        return {
            status: 400,
            message: error
        }
    }
}

async function updateBankDetail (data) {
    try {
        if (data && data.user_id !== null && data.user_id !== '') {
            const res = await bankDetailSchema.findOneAndUpdate({ user_id: data.user_id }, data, { returnOriginal: false });
            return res;
        } else {
            return {
                status: 400,
                message: 'user id is missing'
            }    
        }
    } catch(error) {
        console.error(error)
        return {
            status: 400,
            message: error
        }
    }
}

module.exports = { addBankDetail, updateBankDetail };