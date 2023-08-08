const subscriptionPlanSchema = require('../../../controller/subscription/subscription_plan/subscriptionplan.model');
const userSubscriptionSchema = require('../../../controller/subscription/user_subscription/usersubscription.model');
const incomeRewardSchema = require('../other_income_and_rewards/income_rewards.model');
const { createOrUpdate, getAllUser } = require('../../../controller/subscription/direct_income/direct_income.service');
const { creditIncome } = require('../../../controller/income/income.service');
const { IncomeType, getHours, getTimeInIST } = require('../../../commonHelper');
const moment = require('moment-timezone');
const directIncomeSchema = require('../../../controller/subscription/direct_income/direct_income.model');

async function addSubscriptionPlan (user_id, plan) {
    try {
        const subscriptionPlan = await subscriptionPlanSchema.create({
            plan_title: plan.title,
            plan_description: plan.description, 
            active: true,
            price: plan.price,
            daily_income: plan.daily_income,
            daily_mining_coin: plan.daily_mining_coin,
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
        const plan = await subscriptionPlanSchema.find(query);
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
            // updated_at: getTimeInIST(moment())
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
        // planData.updated_at = getTimeInIST(moment());
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

async function dailyIncome (user_id, subscribedPlan, userSubscriptionsId) {
    try {
        const income = await creditIncome(user_id, userSubscriptionsId, subscribedPlan.daily_income, IncomeType.DAILY);
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
        const userSubscriptions = await userSubscriptionSchema.find({});
        const subscriptionPlan = await subscriptionPlanSchema.find({}).lean().exec();
        if (userSubscriptions && userSubscriptions.length) {
            for (let i = 0; i < userSubscriptions.length; i++) {
                const plan = subscriptionPlan.find(p => p._id.toString() == userSubscriptions[i].plan.toString());
                console.log('PLAN : ', plan);
                const subscriptionStart = userSubscriptions[i].createdAt ? moment(userSubscriptions[i].createdAt).format('DD-MM-YYYY h:mm:ss a') : moment(userSubscriptions[i].created_at).format('DD-MM-YYYY h:mm:ss a');
                const subscriptionTime = moment(userSubscriptions[i].next_daily_income, 'h:mm:ss a').tz('Asia/Kolkata');
                const currentTime = moment(moment(), 'DD-MM-YYYY h:mm:ss a');
                const purchaseDaysElapsed = currentTime.diff(moment(subscriptionStart), 'days');
                // console.log('IS_24_HOURS_COMPLETED : ', getHours(subscriptionTime, currentTime));
                console.log('IS_30_DAYS_COMPLETED : ', purchaseDaysElapsed);
                
                // check subscription is active
                if (userSubscriptions[i].active) {
                    // if (getHours(subscriptionTime, currentTime) > 24) {
                        if (purchaseDaysElapsed < 30) {
                            console.log('BEFORE_DAILY_INCOME : ', userSubscriptions[i].user.toString());
                            await dailyIncome(userSubscriptions[i].user.toString(), plan, userSubscriptions[i]._id.toString());
                            // userSubscriptions[i].updated_at = getTimeInIST(moment());
                            userSubscriptions[i].next_daily_income = moment(getTimeInIST(moment())).tz('Asia/Kolkata').add(24, 'hours');
                            await userSubscriptions[i].save();
                        } else {
                            userSubscriptions[i].active = false;
                            await userSubscriptions[i].save();
                        }
                    // }
                }
                console.log('INCOME_CREDITED');
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

async function creditDailyDirectIncome () {
    try {
        const users = await getAllUser();
        for (let i = 0; i < users.length; i++) {
            // const lastUpdated = moment(users[i].updated_at, 'h:mm:ss a').tz('Asia/Kolkata')
            const currentTime = moment(moment().tz('Asia/Kolkata'), 'h:mm:ss a').tz('Asia/Kolkata');
            // console.log('HOURS : ', getHours(lastUpdated, currentTime));
            // if (getHours(lastUpdated, currentTime) > 24) {
                const incomeReward = await incomeRewardSchema.findOne({}).lean().exec();
                const amount = (users[i].plan.price * parseFloat(incomeReward.direct_income_daily_percent) / 100);
                // we are not considring percentage anymore, we will check our logic by days here percentage will be unit of days
                const days = users[i].complete_percent + 1;
                if (days < 30) {
                    const directIncome = await directIncomeSchema.find({ user: users[i].user, plan: users[i].plan, income_from_user: users[i].income_from_user, date: moment().tz('Asia/Kolkata').format('DD-MM-YYYY') });
                    if (directIncome && directIncome.length === 0) {
                        const income = await creditIncome(users[i].user, null, amount, IncomeType.DAILY_DIRECT);
                        const user = await createOrUpdate(users[i].user, users[i].plan, users[i].income_from_user, days, income._id);
                    } else {
                        console.log('Amount already credited')
                    }
                }
            // }
        }
        console.log('CREDIT_DAILY_DIRECT_INCOME : ', users);
    } catch (error) {
        console.log('CREDIT_DAILY_DIRECT_INCOME_ERROR : ', error);
        return 0;
    }
}

module.exports = { 
    addSubscriptionPlan,
    getSubscriptionPlan,
    activeOrDeactiveSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    getAllSubscribers,
    creditDailyDirectIncome
};