const subscriptionPlanSchema = require('./subscription_plan/subscriptionplan.model');
const userSubscriptionSchema = require('./user_subscription/usersubscription.model');
const fundTransactionSchema = require('../fund/transaction/fundtransaction.model');
const userFundSchema = require('../fund/userfund/userfund.model');
const { getUserFund } = require('../fund/fund.service');
const { FundTransactionType, UserFundStatus } = require('../../commonHelper');

async function subscribePlan (user_id, plan_id) {
    try {
        const userFund = await userFundSchema.findOne({ user_id })
        const plan = await subscriptionPlanSchema.findOne({ _id: plan_id });
        if (userFund) {
            return {
                message: 'please add fund balance'
            }
        }

        if (plan) {
            // check if user has enough balance to purchase the plan
            console.log('USER_FUND_CHECK : ', (userFund._doc.fund_balance < plan._doc.price));
            if (userFund._doc.fund_balance && userFund._doc.fund_balance < plan._doc.price) {
                console.log('USER_FUND : ', userFund);
                return {
                    message: 'user fund balance is insufficient'
                }
            }

            // check if user has already purchased the plan
            const subscribed = await userSubscriptionSchema.findOne({ plan: plan._id });
            if (subscribed) {
                return { message: 'plan already purchased' }
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

            const transaction = fundTransactionSchema.create({
                user_id: user_id,
                amount: plan._doc.price,
                transaction_type: FundTransactionType.PURCHASE,
                status: UserFundStatus.DEDUCTE,
                user_fund: userFund._doc._id,
            })

            return subscribe;
        }
        throw {
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

module.exports = { subscribePlan, getUserSubscription };