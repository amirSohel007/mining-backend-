const directIncomeSchema = require('./direct_income.model');
const moment = require('moment');

async function createOrUpdate (userId, planId, teamUserId, completedPercent, subscriptionTransactionId) {
    try {
        let directIncome = await directIncomeSchema.findOne({ plan: planId, user: userId, income_from_user: teamUserId });
        if (directIncome) {
            if (directIncome.complete_percent && directIncome.complete_percent < 100) {
                directIncome.complete_percent += completedPercent;
                directIncome.subscription_transaction.push(subscriptionTransactionId);
                directIncome.updated_at = moment();
            }
            if (directIncome.complete_percent && directIncome.complete_percent == 100) {
                directIncome.is_completed = true;
            }
            await directIncome.save();
            return directIncome;
        } else {
            directIncome = await directIncomeSchema.create({
                plan: planId,
                user: userId,
                income_from_user: teamUserId,
                subscription_transaction: [subscriptionTransactionId],
                is_completed: false,
                complete_percent: completedPercent
            });
            return directIncome;
        }
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
        const users = await directIncomeSchema.find({ is_completed: false })
        .populate({ path: 'plan', model: 'subscription_plan' }).lean().exec();
        return users;
    } catch (error) {
        console.log('GET_ALL_DIRECT_INCOME_DETAILS_ERROR : ', error);
        return error;
    }
}

module.exports = { createOrUpdate, getAllUserDirectIncomeDetails, getAllUser }