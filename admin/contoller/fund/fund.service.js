const fundTransactionSchema = require('../../../controller/fund/transaction/fundtransaction.model');
const { UserFundStatus } = require('../../../commonHelper');
const adminUserSchema = require('../admin_user/admin_user.model');

const changeFundStatus = (admin_id,transactionId,status) =>{
    return new Promise(async (resolve,reject) => {
        try{
            const checkUserStatus = await fundTransactionSchema.findById({ user_id: transactionId });
            if(checkUserStatus.status === UserFundStatus.ACCEPT){
                resolve({ message: 'status Already Approved'});
                return;
            }
            const transaction = await fundTransactionSchema.findOneAndUpdate({ _id: transactionId },{status : status});
            console.log(transaction);
            if(status === UserFundStatus.ACCEPT){
                updateAdminTotalFund(admin_id,transaction);
            }
            if(transaction){
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
    adminFundUpdate.totalFund += transaction.amount;
    adminFundUpdate.save();
}

module.exports = { changeFundStatus };