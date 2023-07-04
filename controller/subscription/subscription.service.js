const subscriptionPlanSchema = require('./subscription_plan/subscriptionplan.model');
const userSubscriptionSchema = require('./user_subscription/usersubscription.model');
const subscriptionTransactionSchema = require('./transaction/subscription.transaction.model');
const fundTransactionSchema = require('../fund/transaction/fundtransaction.model');
const userFundSchema = require('../fund/userfund/userfund.model');
const userSchema = require('../user/user.model');
const { creditIncome } = require('../income/income.service');
const { FundTransactionType, UserFundStatus, IncomeType, Status, getHours } = require('../../commonHelper');
const moment = require('moment/moment');
const incomeRewardSchema = require('../../admin/contoller/other_income_and_rewards/income_rewards.model');
const { createOrUpdate } = require('./direct_income/direct_income.service');
const directIncomeSchema = require('./direct_income/direct_income.model');

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
            const subscribed = await userSubscriptionSchema.findOne({ plan: plan._id, user: user_id });
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

            // create transaction for purchase subscribption plan
            await fundTransactionSchema.create({
                user_id: user_id,
                amount: plan._doc.price,
                transaction_type: FundTransactionType.PURCHASE,
                status: UserFundStatus.DEDUCTE,
                user_fund: userFund._doc._id,
            })

            const user = await userSchema.findOne({ _id: user_id });
            const incomeReward = await incomeRewardSchema.findOne({}).lean().exec();
            const parentUser = await userSchema.findOne({ my_reffer_code: user.sponser_id });

            // add daily income instantly
            await creditIncome(user_id, subscribe._id.toString(), plan._doc.daily_income, IncomeType.DAILY);
            
            if (user.is_eligibale_for_time_reward) {
                // check for hours and all plan purchased
                const hours = getHours(user.created_at, moment());
                if (hours <= incomeReward.all_subscription_active_time) {
                    const subscriptionPlans = await subscriptionPlanSchema.find({}, '_id').lean().exec();
                    const allPlan = await userSubscriptionSchema.find({ user: user_id, plan: { $in: subscriptionPlans } });
                    if (subscriptionPlans.length === allPlan.length) {
                        
                        // all plan purchase reward
                        await creditIncome(user_id, null, incomeReward.all_subscription_instant_bonus, IncomeType.ALL_PLAN_PURCHASE_REWARD);
                        user.is_eligibale_for_time_reward = false;

                        // credit reward to parent user
                        if (parentUser && parentUser.status === Status.ACTIVE) {
                            await creditIncome(parentUser._id, null, incomeReward.team_reward_instant_bonus, IncomeType.DOWN_TEAM_PLAN_PURCHASE_REWARD);
                        }
                    }
                } else {
                    user.is_eligibale_for_time_reward = false;
                }
            }

            // activate user
            if (user.status == Status.INACTIVE) {
                user.status = Status.ACTIVE;
            }
            user.save();

            // add instant amount of subscribed plan to parent user
            const amount = parseInt(plan.price) * parseInt(incomeReward.direct_income_instant_percent) / 100;
            if (parentUser && parentUser.status === Status.ACTIVE) {
                const income = await creditIncome(parentUser._id, subscribe.plan.toString(), amount, IncomeType.INSTANT_DIRECT);
                const directIncome = await createOrUpdate(parentUser._id, subscribe.plan, user_id, 15, income._id);
                console.log('DIRECT_INCOME : ', directIncome);
            }

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

async function getsubscriptionTransactions (userId, incomeType) {
    try {
        let query = {};
        let transactions = [];
        if (incomeType === 'DIRECT_INCOME') {
            transactions = await directIncomeSchema.find({ user: userId})
            .populate({ path: 'plan', model: 'subscription_plan' })
            .populate({ path: 'subscription_transaction', model: 'subscription_transaction' })
            .populate({ path: 'income_from_user', model: 'user' });
        } else {
            query = { 
                user: userId,
                $or: [
                    { income_type: IncomeType.DAILY },
                    { income_type: IncomeType.ALL_PLAN_PURCHASE_REWARD },
                    { income_type: IncomeType.DOWN_TEAM_PLAN_PURCHASE_REWARD },
                    { income_type: IncomeType.BOOSTING_LEVEL_1 },
                    { income_type: IncomeType.BOOSTING_LEVEL_2 },
                    { income_type: IncomeType.BOOSTING_LEVEL_3 }
                ]
                
            };
            transactions = await subscriptionTransactionSchema.find(query)
            .populate({ 
            path: 'user_subscription', 
            model: 'usersubscription',
            populate: [{ path: 'plan', model: 'subscription_plan' }]
        })
        }
        
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