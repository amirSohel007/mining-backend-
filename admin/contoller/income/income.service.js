const incomeTransactionSchema = require('../../../controller/income/transaction/incometransaction.model');
const { UserFundStatus } = require('../../../commonHelper');
const adminUserSchema = require('../admin_user/admin_user.model');

const changeIncomeStatus = (admin_id,transactionId,status) =>{
    return new Promise(async (resolve,reject) => {
        try{
            const checkUserStatus = await incomeTransactionSchema.findById({ _id: transactionId });
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
                updateAdminTotalIncome(admin_id,checkUserStatus);
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

const updateAdminTotalIncome = async (admin_id,transaction) => {
    const adminFundUpdate = await adminUserSchema.findById({_id:admin_id});
    console.log(adminFundUpdate,transaction);
    adminFundUpdate.totalWithdrawal = adminFundUpdate.totalWithdrawal + transaction.amount;
    adminFundUpdate.save();
}

const getAllIncome = () => {
    return new Promise(async (resolve,reject) => {
        try{
            const incomes = await incomeTransactionSchema.find({});
            if(incomes != null || incomes != undefined){
                resolve(incomes);
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

module.exports = { changeIncomeStatus,getAllIncome };