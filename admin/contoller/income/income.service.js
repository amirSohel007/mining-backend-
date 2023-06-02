const incomeTransactionSchema = require('../../../controller/income/transaction/incometransaction.model');
const { UserFundStatus } = require('../../../commonHelper');
const adminUserSchema = require('../admin_user/admin_user.model');

const changeIncomeStatus = (admin_id,transactionId,status) =>{
    return new Promise(async (resolve,reject) => {
        try{
            const checkUserStatus = await incomeTransactionSchema.findById({ _id: transactionId });
            if(checkUserStatus.status === UserFundStatus.ACCEPT){
                resolve({ message: 'status Already Approved'});
                return;
            }
            const incomeTransaction = await incomeTransactionSchema.findOneAndUpdate({ _id: transactionId },{status : status});
            console.log(incomeTransaction);
            if(status === UserFundStatus.ACCEPT){
                updateAdminTotalIncome(admin_id,incomeTransaction);
            }
            if(incomeTransaction){
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

const updateAdminTotalIncome = async (admin_id,transaction) => {
    const adminFundUpdate = await adminUserSchema.findById({_id:admin_id});
    console.log(adminFundUpdate,transaction);
    adminFundUpdate.totalWithdrawal += transaction.amount;
    adminFundUpdate.save();
}

module.exports = { changeIncomeStatus };