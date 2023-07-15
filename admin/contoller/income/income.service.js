const incomeTransactionSchema = require('../../../controller/income/transaction/incometransaction.model');
const userIncomeSchema = require('../../../controller/income/income.model');
const { UserFundStatus } = require('../../../commonHelper');
const adminUserSchema = require('../admin_user/admin_user.model');

const changeIncomeStatus = (admin_id,transactionId,status) =>{
    return new Promise(async (resolve,reject) => {
        try{
            const checkUserStatus = await incomeTransactionSchema.findById({ _id: transactionId });
            if(status == UserFundStatus.ACCEPT && checkUserStatus?.status === UserFundStatus.ACCEPT){
                resolve({ message: 'Status Already Approved'});
                return;
            }
            if(status == UserFundStatus.ACCEPT && checkUserStatus?.status === UserFundStatus.REJECT){
                resolve({ message: 'Status Already REJECTED'});
                return;
            }
            if(status == UserFundStatus.REJECT && checkUserStatus?.status === UserFundStatus.REJECT){
                resolve({ message: 'Status Already Rejected'});
                return;
            }
            if(status == UserFundStatus.REJECT &&checkUserStatus?.status === UserFundStatus.PENDING){
                checkUserStatus.status = UserFundStatus.REJECT;
                await checkUserStatus.save();
                resolve({ message: 'Status updated'});
                return;
            }
            if(status == UserFundStatus.ACCEPT && checkUserStatus?.status === UserFundStatus.PENDING){
                checkUserStatus.status = UserFundStatus.ACCEPT;
                await checkUserStatus.save();
                const userIncome = await userIncomeSchema.findOne({ user_id: checkUserStatus.user_id });
                userIncome.balance -= checkUserStatus.amount;
                await userIncome.save();
                updateAdminTotalIncome(admin_id,checkUserStatus);
            }
            if(checkUserStatus){
                resolve({ message: 'Status updated'})
            }else{
                reject({ message: 'User not found'})
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
    await adminFundUpdate.save();
}

const getAllIncome = (status) => {
    return new Promise(async (resolve,reject) => {
        try{
            // let incomes = [];
            const incomes = await incomeTransactionSchema.find({})
            .populate({ 
                path: 'user_id',
                model: 'user',
                populate: [{
                    path: 'bank_detail',
                    model: 'bankdetail'
                }]
            }).exec();
            if(incomes && incomes.length > 0){
                switch(status)
                {
                    case UserFundStatus.ALL : resolve(incomes);break;
                    case UserFundStatus.ACCEPT : resolve(filterAcceptIncome(incomes)); break;
                    case UserFundStatus.PENDING : resolve(filterPendingIncome(incomes));break;
                    case UserFundStatus.REJECT : resolve(filterRejectIncome(incomes));break;
                }
                
            }
            resolve(incomes);
        }catch(error){
            reject({
                status: error.status || 500,
                message: error
            })
        }
    });
}

const filterAcceptIncome = (incomes) => {
    return incomes.filter((income) => income.status === UserFundStatus.ACCEPT); 
}

const filterPendingIncome = (incomes) => {
    return incomes.filter((income) => income.status === UserFundStatus.PENDING); 
}

const filterRejectIncome = (incomes) => {
    return incomes.filter((income) => income.status === UserFundStatus.REJECT); 
}
module.exports = { changeIncomeStatus,getAllIncome };