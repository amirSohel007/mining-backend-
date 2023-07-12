const coinWalletSchema = require('./coinwallet/coinwallet.model');
const coinTransactionSchema = require('./transaction/cointransaction.model');
const subscriptionPlanSchema = require('../subscription/subscription_plan/subscriptionplan.model');
const userSubscriptionSchema = require('../subscription/user_subscription/usersubscription.model');
const { Coin, getHours } = require('../../commonHelper');
const moment = require('moment');

async function generateCoin (userId, subscriptionId) {
    try {
        const plan = await subscriptionPlanSchema.findOne({ _id: subscriptionId });
        let wallet = await coinWalletSchema.findOne({ user: userId });
        if (!plan) {
            throw {
                status: 400,
                message: 'no subscription plan found'
            };
        }
        const start =  moment(wallet.next_mining, 'h:mm:ss a');
        const end = moment(moment(), 'h:mm:ss a');
        const hours = getHours(start, end);
        if (hours >= 24) {
            if (!wallet) {
                wallet = await coinWalletSchema.create({
                    user: userId,
                    coin_balance: plan.daily_mining_coin,
                    coin_transaction: [],
                    next_mining: moment().add(24, 'hours'),
                });
            }
            const coinTransaction = await coinTransactionSchema.create({
                user: userId,
                coin_wallet: wallet._id,
                subscription: plan._id,
                coin: plan.daily_mining_coin,
                transaction_type: Coin.DAILY
            });
            wallet.coin_transaction.push(coinTransaction._id);
            wallet.coin_balance = plan.daily_mining_coin;
            wallet.next_mining = moment().add(24, 'hours');
            await wallet.save();
            return coinTransaction;
        } else {
            throw {
                status: 400,
                message: 'coin can not be mine before 24 hours'
            }
        }
    } catch (error) {
        console.log('GENERATE_COIN_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        };
    }
}

async function getMining (userId) {
    try {
        const transaction = await coinTransactionSchema.find({ user: userId })
        // .populate({ path: 'user', ref: 'user' })
        .populate({ path: 'subscription', ref: 'subscription_plan' });
        return transaction;
    } catch (error) {
        console.log('GET_MINING_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        };
    }
}

async function getUserSubscription (userId) {
    try {
        const plan = await userSubscriptionSchema.find({ user: userId })
        return plan;
    } catch (error) {
        console.log('GET_USER_SUBSCRIPTION_FOR COIN_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        };
    }    
}

module.exports = { generateCoin, getMining, getUserSubscription }