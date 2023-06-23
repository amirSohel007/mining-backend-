const userIncomeSchema = require('./income.model');
const incomeTransactionSchema = require('./transaction/incometransaction.model');
const subscriptionTransactionSchema = require('../subscription/transaction/subscription.transaction.model');
const userSchema = require('../user/user.model');
const { UserFundStatus } = require('../../commonHelper');

async function creditIncome (user_id, plan_id, amount, incomeType) {
    try {
        let user = await userSchema.findOne({ _id: user_id });
        if (user && !user.message) {
            let userIncome = await userIncomeSchema.findOne({ user_id });
            if (!userIncome) {
                userIncome = await userIncomeSchema.create({ user_id, balance: 0.0 });
            }
            let newTransaction = await subscriptionTransactionSchema.create({
                user_id: user_id,
                user_subscription: plan_id,
                amount: amount,
                income_type: incomeType
            });
            userIncome.balance += amount;
            userIncome.subscription.push(newTransaction._id);
            userIncome.save();
            user.income = userIncome._id;
            user.save();
            return userIncome;
        } else {
            throw {
                status: 400,
                message: 'incorrect user id'
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
        if (userIncome) {
            if (userIncome.first_withdrawal && amount > 300) {
                throw {
                    status: 400,
                    message: 'first withdrawal can not be exceed 300'
                }
            } else if (userIncome.balance < amount) {
                throw {
                    status: 400,
                    message: 'insufficient balance'
                }
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
            userIncome.save();
            return userIncome;
        } else {
            throw {
                status: 400,
                message: 'incorrect user id'
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
            return { message: 'record not found' };
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
            return { message: 'record not found' };
        }
    } catch (error) {
        console.log('GET_INCOME_TRANSACTION_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

module.exports = { creditIncome, withdrawlIncome, getIncome, getIncomeTransaction };