const subscriptionPlanSchema = require('./subscription_plan/subscriptionplan.model');
const userSubscriptionSchema = require('./user_subscription/usersubscription.model');
const subscriptionTransactionSchema = require('./transaction/subscription.transaction.model');
const fundTransactionSchema = require('../fund/transaction/fundtransaction.model');
const userFundSchema = require('../fund/userfund/userfund.model');
const userSchema = require('../user/user.model');
const { creditIncome } = require('../income/income.service');
const { FundTransactionType, UserFundStatus, IncomeType, Status } = require('../../commonHelper');

async function subscribePlan (user_id, plan_id) {
    try {
        const userFund = await userFundSchema.findOne({ user_id })
        const plan = await subscriptionPlanSchema.findOne({ _id: plan_id });
        if (!userFund) {
            throw {
                status: 400,
                message: 'please add fund balance'
            }
        }

        if (plan) {
            // check if user has enough balance to purchase the plan
            console.log('USER_FUND_CHECK : ', (userFund._doc.fund_balance < plan._doc.price));
            // console.log({userFund},{plan})
            if (userFund._doc.fund_balance && userFund._doc.fund_balance < plan._doc.price) {
                console.log('USER_FUND : ', userFund);
                throw {
                    status: 400,
                    message: 'user fund balance is insufficient'
                }
            }

            // check if user has already purchased the plan
            const subscribed = await userSubscriptionSchema.findOne({ plan: plan._id ,user:user_id});
            if (subscribed) {
                throw { 
                    status: 400,
                    message: 'plan already purchased'
                }
            }
            
            // purchasing the plan
            const subscribe = await userSubscriptionSchema.create({
                user: user_id,
                plan: plan._id,
                next_daily_income: Date.now()
            });

            // deduct the user balance
            userFund._doc.fund_balance -= plan._doc.price;
            userFund.save();
            userFund.markModified('fund_balance');

            await fundTransactionSchema.create({
                user_id: user_id,
                amount: plan._doc.price,
                transaction_type: FundTransactionType.PURCHASE,
                status: UserFundStatus.DEDUCTE,
                user_fund: userFund._doc._id,
            })

            // activate user
            const user = await userSchema.findOne({ _id: user_id });
            if (user.status == Status.INACTIVE) {
                user.status = Status.ACTIVE;
                user.save();
            }

            // add daily income instantly
            await creditIncome(user_id, subscribe._id.toString(), plan._doc.daily_income, IncomeType.DAILY);
            return subscribe;
        }
        throw {
            status: 400,
            message: 'plan does not exist'
        }
    } catch (error) {
        console.log('SUBSCRIBE_PLAN_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function getUserSubscription (user_id) {
    try {
        const subscriptionPlan = await subscriptionPlanSchema.find({ active: true }).lean().exec();
        const userSubscription = await userSubscriptionSchema.find({ user: user_id }).lean().exec();
        if (subscriptionPlan && subscriptionPlan.length) {
            for (let i = 0; i < subscriptionPlan.length; i++) {
                let subscribed = userSubscription.find(u => u.plan.toString() == subscriptionPlan[i]._id.toString());
                if (subscribed) {
                    subscriptionPlan[i]['purchased'] = true;
                } else {
                    subscriptionPlan[i]['purchased'] = false;
                }
            }
        }
        return subscriptionPlan;
    } catch (error) {
        console.log('GET_USER_SUBSCRIPTION_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function getsubscriptionTransactions (user_id, incomeType) {
    try {
        let query = { user: user_id };
        if (incomeType) {
            query['income_type'] = incomeType;
        }
        const transactions = await subscriptionTransactionSchema.find(query)
        .populate({ 
            path: 'user_subscription', 
            model: 'usersubscription',
            populate: [{ path: 'plan', model: 'subscription_plan' }]
        })
        return transactions;
    } catch (error) {
        console.log('GET_USER_SUBSCRIPTION_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

module.exports = { subscribePlan, getUserSubscription, getsubscriptionTransactions };