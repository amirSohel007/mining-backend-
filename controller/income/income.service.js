const userIncomeSchema = require('./income.model');
const incomeTransactionSchema = require('./transaction/incometransaction.model');
const subscriptionTransactionSchema = require('../subscription/transaction/subscription.transaction.model');
const userSchema = require('../user/user.model');
const levelIncomeSchema = require('../user/levelincome.model');
const bankDetailSchema = require('../user/bankdetail/bankdetail.model');
const { UserFundStatus, getHours, IncomeType, Status } = require('../../commonHelper');
const moment = require('moment');

async function creditIncome (user_id, userSubscriptionId, amount, incomeType) {
    try {
        let user = await userSchema.findOne({ _id: user_id });
        if (user) {
            let userIncome = await userIncomeSchema.findOne({ user_id });
            if (!userIncome) {
                userIncome = await userIncomeSchema.create({ user_id, balance: 0.0 });
            }
            let newTransaction = await subscriptionTransactionSchema.create({
                user: user_id,
                user_subscription: userSubscriptionId,
                amount: amount,
                income_type: incomeType
            });
            userIncome.balance += amount;
            userIncome.subscription.push(newTransaction._id);
            await userIncome.save();
            user.income = userIncome._id;
            await user.save();
            return newTransaction;
        } else {
            throw {
                status: 400,
                message: 'User not found or inactive'
            }
        }
    } catch(error) {
        console.log('CREDIT_INCOME_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function withdrawlIncome (user_id, amount) {
    try {
        let userIncome = await userIncomeSchema.findOne({ user_id });
        let bankDetails = await bankDetailSchema.findOne({ user_id });
        if (!bankDetails) {
            throw {
                status: 400,
                message: "Please add bank details."
            }
        }
        if (userIncome) {
            const lastTransaction = await incomeTransactionSchema.find({ user_id }).sort({ created_at: 1 });
            console.log('TRANs : ', lastTransaction);
            if (userIncome.first_withdrawal && parseInt(amount) !== 250) {
              throw {
                status: 400,
                message: "On first withdrawal only 250 rupees is allowed",
              };
            } else if (userIncome.balance < parseInt(amount)) {
              throw {
                status: 400,
                message: "Insufficient balance",
              };
            } 
            else if (
              parseInt(amount) % 500 != 0 &&
              !userIncome.first_withdrawal
            ) {
              throw {
                status: 400,
                message: "Amount should be multiplier of 500",
              };
            } 

            else if (
              getHours(lastTransaction[lastTransaction.length - 1]?.created_at, moment()) < 24
            ) {
              throw {
                status: 400,
                message: ` Try after ${
                  24 - getHours(lastTransaction[lastTransaction.length - 1]?.created_at, moment())
                }  hours`,
              };
            }
            const transaction = await incomeTransactionSchema.create({
                user_id: user_id,
                amount: amount,
                status: UserFundStatus.PENDING
            });
            
            
            if(userIncome.first_withdrawal) {
                userIncome.first_withdrawal = false
            }
            userIncome.transaction.push(transaction._id);
            // userIncome -= amount;
            await userIncome.save();
            return userIncome;
        } else {
            throw {
                status: 400,
                message: 'Incorrect user id'
            }
        }
    } catch(error) {
        console.log('WITHDRAWL_INCOME_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function getIncome (user_id) {
    try {
        let income = await userIncomeSchema.findOne({ user_id });
        if (income) {
            return income;
        } else {
            return { message: 'Record not found' };
        }
    } catch (error) {
        console.log('GET_INCOME_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function getIncomeTransaction (user_id, status) {
    try {
        let query = { user_id };
        if (status) {
            query.status = status
        }

        let incomeTransaction = await incomeTransactionSchema.find(query);
        if (incomeTransaction) {
            return incomeTransaction;
        } else {
            return { message: 'Record not found' };
        }
    } catch (error) {
        console.log('GET_INCOME_TRANSACTION_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function getLevelIncome (userId) {
    try {
        // let type = [];
        // let query = { user: userId };
        // for (let i = 0; i < IncomeType.LEVEL_INCOME.length;i++) {
        //     type.push({ income_type: IncomeType.LEVEL_INCOME[i] });
        // }
        // query['$or'] = type;
        const levelIncome = await levelIncomeSchema.find({ user: userId })
        .populate({ path: 'user', model: 'user', select: '-downline_team _id email my_reffer_code full_name' })
        .populate({ path: 'income_from_user', model: 'user', select: '-downline_team _id email my_reffer_code full_name' })
        .populate({ 
            path: 'subscription_transaction', 
            model: 'subscription_transaction'
        }).lean().exec();
        // const transactions = await subscriptionTransactionSchema.find(query)
        // .populate({ 
        //     path: 'user_subscription', 
        //     model: 'usersubscription',
        //     populate: [{ path: 'plan', model: 'subscription_plan' }]
        // });
        const filteredData = levelIncome.map(obj => {
            let newObj = {
                _id: obj._id,
                user: {
                    _id: obj.user._id,
                    my_reffer_code: obj.user.my_reffer_code,
                    full_name: obj.user.full_name,
                    email: obj.user.email,
                },
                level: obj.child_user_level,
                from_user: obj.income_from_user.full_name,
                amount: obj.subscription_transaction?.amount,
                income_type: obj.subscription_transaction?.income_type,
                created_at: obj.created_at
            }
            return newObj;
        });
        return filteredData;
    } catch (error) {
        console.log('GET_LEVEL_INCOME_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

module.exports = { creditIncome, withdrawlIncome, getIncome, getIncomeTransaction, getLevelIncome };