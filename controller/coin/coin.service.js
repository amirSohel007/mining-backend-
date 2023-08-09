const coinWalletSchema = require('./coinwallet/coinwallet.model');
const coinTransactionSchema = require('./transaction/cointransaction.model');
const subscriptionPlanSchema = require('../subscription/subscription_plan/subscriptionplan.model');
const userSubscriptionSchema = require('../subscription/user_subscription/usersubscription.model');
const subscriptionCoinSchema = require('./subscription-coin/subscriptioncoin.model');
const { Coin, getHours } = require('../../commonHelper');
const moment = require('moment-timezone')

async function generateCoin (userId, subscriptionId) {
    try {
        const plan = await subscriptionPlanSchema.findOne({ _id: subscriptionId });
        let wallet = await coinWalletSchema.findOne({ user: userId });
        if (!plan) {
            throw {
                status: 400,
                message: 'No subscription plan found'
            };
        }
        
        let subscriptionCoin = await subscriptionCoinSchema.findOne({ user: userId, subscription: subscriptionId });
        if (!subscriptionCoin) {
            subscriptionCoin = await subscriptionCoinSchema.create({
                user: userId,
                subscription: subscriptionId,
                coin_transaction: [],
            });
        }

        const start =  subscriptionCoin ? moment(subscriptionCoin.next_mining, 'h:mm:ss a').tz('Asia/Kolkata') : moment(moment().tz('Asia/Kolkata'), 'h:mm:ss a').tz('Asia/Kolkata');
        const end = moment(moment().tz('Asia/Kolkata'), 'h:mm:ss a');
        const hours = getHours(start, end);
        // if ((!wallet) || (subscriptionCoin && !subscriptionCoin.next_mining ) || (hours >= 24)) {
        if ((!wallet) || (subscriptionCoin && !subscriptionCoin.next_mining ) || (hours)) {
            if (!wallet) {
                wallet = await coinWalletSchema.create({
                    user: userId,
                    coin_transaction: []
                });
            }
            const coinTransaction = await coinTransactionSchema.create({
                user: userId,
                coin_wallet: wallet._id,
                subscription: plan._id,
                coin: plan.daily_mining_coin,
                transaction_type: Coin.DAILY
            });
            
            subscriptionCoin.coin_wallet = wallet._id;
            subscriptionCoin.coin_transaction.push(coinTransaction._id);
            subscriptionCoin.next_mining =  moment().utc().add(1, 'days');
            await subscriptionCoin.save();

            wallet.coin_balance = parseFloat(wallet.coin_balance) + parseFloat(plan.daily_mining_coin);
            // wallet.updated_at = moment().utc();
            console.log('MINING : ', parseFloat(plan.daily_mining_coin));
            console.log('WALLET_BALANCE : ', wallet.coin_balance);
            await wallet.save();
            return coinTransaction;
        } else {
            return 0;
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