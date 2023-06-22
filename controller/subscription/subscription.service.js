const subscriptionPlanSchema = require('./subscription_plan/subscriptionplan.model');
const userSubscriptionSchema = require('./user_subscription/usersubscription.model');
const subscriptionTransactionSchema = require('./transaction/subscription.transaction.model');
const userIncomeSchema = require('../income/income.model');
const { IncomeType } = require('../../commonHelper');

async function subscribePlan (user_id, plan_id) {
    try {
        const plan = await subscriptionPlanSchema.findOne({ _id: plan_id });
        if (plan) {
            const subscribed = await userSubscriptionSchema.findOne({ plan: plan._id });
            if (subscribed) {
                return { message: 'plan already purchased' }
            } 
            const subscribe = await userSubscriptionSchema.create({
                user: user_id,
                plan: plan._id,
                next_daily_income: Date.now()
            });
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