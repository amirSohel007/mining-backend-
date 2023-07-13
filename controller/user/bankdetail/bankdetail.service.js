const bankDetailSchema = require('./bankdetail.model');
const { updateUserDetails } = require('../user.service');

async function createOrUpdateBankDetail (data) {
    try {
        let res = await bankDetailSchema.findOneAndUpdate({ user_id: data.user_id }, data, { returnOriginal: false });
        if (res == null) {
            res = await bankDetailSchema.create(data);
        }
        await updateUserDetails({ _id: data.user_id }, { bank_detail: res._id.toString() });
        return res;
    } catch(error) {
        console.error('CREATE_OR_UPDATE_BANK_DETAIL_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        };
    }
}

async function getBankDetail (user_id) {
    try {
        let bankDetail = await bankDetailSchema.findOne({ user_id })
        if (bankDetail) {
            return bankDetail;
        }
        return { message: 'Record not found'};
    } catch (error) {
        console.error('GET_BANK_DETAIL_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        };
    }
}

module.exports = { createOrUpdateBankDetail, getBankDetail };