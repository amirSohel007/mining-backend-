const fundTransactionSchema = require('../../../controller/fund/transaction/fundtransaction.model');
const { UserFundStatus } = require('../../../commonHelper');
const adminUserSchema = require('../admin_user/admin_user.model');

const changeFundStatus = (admin_id,transactionId,status) =>{
    return new Promise(async (resolve,reject) => {
        try{
            const checkUserStatus = await fundTransactionSchema.findById({ _id: transactionId });
            if(status == UserFundStatus.ACCEPT && checkUserStatus.status === UserFundStatus.ACCEPT){
                resolve({ message: 'status Already Approved'});
                return;
            }
            if(status == UserFundStatus.ACCEPT && checkUserStatus.status === UserFundStatus.REJECT){
                resolve({ message: 'status Already REJECTED'});
                return;
            }
            if(status == UserFundStatus.REJECT && checkUserStatus.status === UserFundStatus.REJECT){
                resolve({ message: 'status Already Rejected'});
                return;
            }
            if(status == UserFundStatus.REJECT &&checkUserStatus.status === UserFundStatus.PENDING){
                checkUserStatus.status = UserFundStatus.REJECT;
                checkUserStatus.save();
                resolve({ message: 'status updated'});
                return;
            }
            if(status == UserFundStatus.ACCEPT && checkUserStatus.status === UserFundStatus.PENDING){
                checkUserStatus.status = UserFundStatus.ACCEPT;
                checkUserStatus.save();
                updateAdminTotalFund(admin_id,checkUserStatus);
            }
            if(checkUserStatus){
                resolve({ message: 'status updated'})
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

const updateAdminTotalFund = async (admin_id,transaction) => {
    const adminFundUpdate = await adminUserSchema.findById({_id:admin_id});
    console.log(adminFundUpdate,transaction);
    adminFundUpdate.totalFund =  adminFundUpdate.totalFund  + transaction.amount;
    adminFundUpdate.save();
}

const getAllFunds = () => {
    return new Promise(async (resolve,reject) => {
        try{
            const fund = await fundTransactionSchema.find({});
            if(fund != null || fund != undefined){
                resolve(fund);
            }else{
                reject({ message: 'some error occured'});
            }
        }catch(error){
            reject({
                status: error.status || 500,
                message: error
            })
        }
    });
}

module.exports = { changeFundStatus , getAllFunds};