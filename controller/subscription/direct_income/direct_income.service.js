const { Status, IncomeType } = require('../../../commonHelper');
const userSchema = require('../../user/user.model');
const subscriptionTransactionSchema = require('../transaction/subscription.transaction.model');
const directIncomeSchema = require('./direct_income.model');

async function createOrUpdate (userId, planId, teamUserId, completedPercent, subscriptionTransactionId) {
    try {
        const directIncome = await directIncomeSchema.create({
            plan: planId,
            user: userId,
            income_from_user: teamUserId,
            subscription_transaction: [subscriptionTransactionId],
            is_completed: false,
            complete_percent: completedPercent
        });
        return directIncome;
    } catch (error) {
        console.log('CREATE_OR_UPDATE_DIRECT_INCOME_ERROR : ', error);
        return error;
    }
}

async function getAllUserDirectIncomeDetails (userId) {
    try {
        const userDirectIncomePlans = await directIncomeSchema.find({ user: userId });
        return userDirectIncomePlans;
    } catch (error) {
        console.log('GET_ALL_DIRECT_INCOME_DETAILS_ERROR : ', error);
        return error;
    }
}

async function getAllUser () {
    try {
        const transactions = await subscriptionTransactionSchema.find({ income_type: IncomeType.INSTANT_DIRECT }, '_id');
        const users = await directIncomeSchema.find({ is_completed: false, subscription_transaction: { $in: transactions } })
        .populate({ path: 'plan', model: 'subscription_plan' })
        .populate({ path: 'income_from_user', model: 'user' })
        .populate({ path: 'subscription_transaction', model: 'subscription_transaction' }).lean().exec();
        return users;
    } catch (error) {
        console.log('GET_ALL_DIRECT_INCOME_DETAILS_ERROR : ', error);
        return error;
    }
}

module.exports = { createOrUpdate, getAllUserDirectIncomeDetails, getAllUser }