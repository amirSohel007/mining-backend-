const subscriptionPlanSchema = require('../../../controller/subscription/subscription_plan/subscriptionplan.model');
const userSubscriptionSchema = require('../../../controller/subscription/user_subscription/usersubscription.model');
const subscriptionTransactionSchema = require('../../../controller/subscription/transaction/subscription.transaction.model');
const { creditIncome } = require('../../../controller/income/income.service');
const { IncomeType } = require('../../../commonHelper');
const moment = require('moment');

async function addSubscriptionPlan (user_id, plan) {
    try {
        const subscriptionPlan = await subscriptionPlanSchema.create({
            plan_title: plan.title,
            plan_description: plan.description, 
            active: true,
            price: plan.price,
            daily_income: plan.daily_income,
            created_by: user_id,
            updated_by: user_id
        })
        return subscriptionPlan;
    } catch (error) {
        console.log('ADD_SUBSCRIPTION_PLAN_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function getSubscriptionPlan (plan_id = '') {
    try {
        let query = {};
        if (plan_id) {
            query = { _id: plan_id };
        }
        const plan = await subscriptionPlanSchema.findOne(query);
        return plan;
    } catch (error) {
        console.log('GET_SUBSCRIPTION_PLAN_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function activeOrDeactiveSubscriptionPlan (user_id, plan_id = '', active = true) {
    try {
        const updateData = {
            active,
            updated_by: user_id,
            updated_at: Date.now()
        }
        const plan = await subscriptionPlanSchema.findOneAndUpdate({ _id: plan_id }, updateData, { returnOriginal: false });
        return plan;
    } catch (error) {
        console.log('ACTIVE_OR_DEACTIVE_SUBSCRIPTION_PLAN_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function updateSubscriptionPlan (user_id, plan_id = '', planData) {
    try {
        planData.updated_at = Date.now();
        planData.updated_by = user_id;
        const plan = await subscriptionPlanSchema.findOneAndUpdate({ _id: plan_id }, planData, { returnOriginal: false });
        return plan;
    } catch (error) {
        console.log('UPDATE_SUBSCRIPTION_PLAN_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function deleteSubscriptionPlan (plan_id = '') {
    try {
        const plan = await subscriptionPlanSchema.deleteOne({ _id: plan_id });
        return plan;
    } catch (error) {
        console.log('DELETE_SUBSCRIPTION_PLAN_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function dailyIncome (user_id, subscribedPlan) {
    try {
        const income = await creditIncome(user_id, subscribedPlan._id.toString(), subscribedPlan.daily_income, IncomeType.DAILY);
        return income;
    } catch (error) {
        console.log('DAILY_INCOME_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function getAllSubscribers () {
    try {        
        const userSubscriptions = await userSubscriptionSchema.find({}).lean().exec();
        const subscriptionPlan = await subscriptionPlanSchema.find({}).lean().exec();
        if (userSubscriptions && userSubscriptions.length) {
            for (let i = 0; i < userSubscriptions.length; i++) {
                const plan = subscriptionPlan.find(p => p._id.toString() == userSubscriptions[i].plan.toString());
                console.log('PLAN : ', plan);
                const subscriptionTime = moment(userSubscriptions[i].next_daily_income, 'h:mm:ss a');
                const currentTime = moment(Date.now(), 'h:mm:ss a');
                console.log('IS_24_HOURS_COMPLETED : ', currentTime.isAfter(subscriptionTime));
                if (currentTime.isAfter(subscriptionTime)) {
                    await dailyIncome(userSubscriptions[i].user.toString(), plan);
                    userSubscriptions[i].updated_at = Date.now();
                    userSubscriptions[i].next_daily_income = moment(userSubscriptions[i].created_at).add(24, 'hours');
                    userSubscriptions[i].save();
                }
                console.log('INCOME_CREDITED : ', result);
            }
            return 1;
        }
        console.log('GET_ALL_SUBSCRIBERS', userSubscriptions);
        return userSubscriptions;
    } catch (error) {
        console.log('GET_ALL_SUBSCRIBERS_ERROR : ', error);
        return 0;
    }
}

module.exports = { 
    addSubscriptionPlan,
    getSubscriptionPlan,
    activeOrDeactiveSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    getAllSubscribers
};