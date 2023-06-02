const bankDetailSchema = require('../../../controller/user/bankdetail/bankdetail.model');
const { createOrUpdateBankDetail } = require('../../../controller/user/bankdetail/bankdetail.service');

const getAllUsersBankDetails = () =>{
    return new Promise(async (resolve,reject) => {
        try{
            const bankDetail = await bankDetailSchema.find({});
            console.log(bankDetail);
            if(bankDetail && bankDetail.length > 0){
                resolve(bankDetail);
            }else{
                reject(bankDetail);
            }
        }catch(error){
            reject({
                status: error.status || 500,
                message: error
            })
        }
    })
}

const resetUserBankDetails = (bankDetails) =>{
    return new Promise(async (resolve,reject) => {
        try{
            const bankDetail = await createOrUpdateBankDetail(bankDetails);
            console.log(bankDetail);
            if(bankDetail){
                resolve({ message: 'bank details reset'})
            }else{
                reject({ message: 'user not found'})
            }
        }catch(error){
            reject({
                status: error.status || 500,
                message: error
            })
        }
    })
}


module.exports = { getAllUsersBankDetails,resetUserBankDetails };