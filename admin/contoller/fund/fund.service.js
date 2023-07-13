const fundTransactionSchema = require('../../../controller/fund/transaction/fundtransaction.model');
const { UserFundStatus, getBaseUrl } = require('../../../commonHelper');
const adminUserSchema = require('../admin_user/admin_user.model');
const userFundSchema = require('../../../controller/fund/userfund/userfund.model');
const { get_s3_file } = require('../../../s3_confif');
const config = require('../../../config').config();

const changeFundStatus = (admin_id,transactionId,status) =>{
    return new Promise(async (resolve,reject) => {
        try{
            const checkUserStatus = await fundTransactionSchema.findById({ _id: transactionId });
            console.log({checkUserStatus});
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
                const updatedFundBalance = await updateUserFundBalance(checkUserStatus.user_fund, checkUserStatus.amount);
                if (updatedFundBalance) {
                    checkUserStatus.status = UserFundStatus.ACCEPT;
                    await checkUserStatus.save();
                    updateAdminTotalFund(admin_id,checkUserStatus);
                    resolve(checkUserStatus);
                } else {
                    reject({ message: 'Unable to add fund' });
                }
            }
            if(checkUserStatus){
                resolve({ message: 'Status updated'})
            }else{
                reject({ message: 'User not found'})
            }
        }catch(error){
            console.log({error})
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
    adminFundUpdate.totalFund =  adminFundUpdate.totalFund ? adminFundUpdate.totalFund  + transaction.amount : transaction.amount;
    await adminFundUpdate.save();
}

const getAllFunds = (status, req) => {
    return new Promise(async (resolve,reject) => {
        try{
            const fund = await fundTransactionSchema.find({transaction_type:"FUND_ADD"}).populate({ path: 'user_id' }).lean().exec();
            if(fund && fund.length > 0){
                const result = [];
                for (i = 0; i < fund.length; i++) {
                    let obj = { ...fund[i] };
                    if (config.useS3 && obj.fund_receipt && obj.fund_receipt.indexOf('receipts/') != -1) {
                        obj.fund_receipt = await get_s3_file(obj.fund_receipt);
                    }
                    console.log('OBJ : ', obj.fund_receipt);
                    if (obj.fund_receipt) {
                        obj.fund_receipt = `${getBaseUrl(req)}/${obj.fund_receipt}`;
                    }
                    console.log('OBJ : ', `${getBaseUrl(req)}/${obj.fund_receipt}`);
                    result.push(obj);
                }
                switch(status)
                {
                    case UserFundStatus.ALL : resolve(result);break;
                    case UserFundStatus.ACCEPT : resolve(filterAcceptFund(result)); break;
                    case UserFundStatus.PENDING : resolve(filterPendingFund(result));break;
                    case UserFundStatus.REJECT : resolve(filterRejectFund(result));break;
                }
                
            }
            resolve(fund);
        }catch(error){
            reject({
                status: error.status || 500,
                message: error
            })
        }
    });
}

const filterAcceptFund = (funds) => {
    return funds.filter((fund) => fund.status === UserFundStatus.ACCEPT); 
}

const filterPendingFund = (funds) => {
    return funds.filter((fund) => fund.status === UserFundStatus.PENDING); 
}

const filterRejectFund = (funds) => {
    return funds.filter((fund) => fund.status === UserFundStatus.REJECT); 
}

async function updateUserFundBalance (userFundId, amount) {
    try {
        const fund = await userFundSchema.findOne({ _id: userFundId });
        fund.fund_balance += amount;
        await fund.save();
        console.log('USER_FUND : ', fund);
        return fund;
    } catch (error) {
        console.log('UPDATE_USER_FUND_ERROR : ', error);
        throw error;
    }
}

module.exports = { changeFundStatus , getAllFunds};