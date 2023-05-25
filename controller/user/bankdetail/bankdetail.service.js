const bankDetailSchema = require('./bankdetail.model');
const { updateUserDetails } = require('../user.service');

async function createOrUpdateBankDetail (data) {
    try {
        let res = await bankDetailSchema.findOneAndUpdate({ user_id: data.user_id }, data, { returnOriginal: false });
        if (res == null) {
            res = await bankDetailSchema.create(data);
        }
        await updateUserDetails(data.user_id, { bank_detail: res._id.toString() });
        return res;
    } catch(error) {
        console.error('CREATE_OR_UPDATE_BANK_DETAIL_ERROR : ', error);
        throw {
            status: 500,
            message: error
        };
    }
}

module.exports = { createOrUpdateBankDetail };