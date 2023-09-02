const coinWalletSchema = require('./coinwallet/coinwallet.model');
const coinTransactionSchema = require('./transaction/cointransaction.model');
const subscriptionPlanSchema = require('../subscription/subscription_plan/subscriptionplan.model');
const userSubscriptionSchema = require('../subscription/user_subscription/usersubscription.model');
const subscriptionCoinSchema = require('./subscription-coin/subscriptioncoin.model');
const { Coin, getHours, IncomeType } = require('../../commonHelper');
const moment = require('moment-timezone');
const incomeTransactionSchema = require('../income/transaction/incometransaction.model');
const { creditIncome } = require('../income/income.service');

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
        const transaction = await coinTransactionSchema.find({
            user: userId,
            $or: [
                { transaction_type: Coin.DAILY }
            ]
        })
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

async function withdrawCoin (userId, amount) {
    try {
        if (amount < 20) {
            console.log('MINIMUM_AMOUNT : ', amount);
            throw {
                status: 400,
                message: "Amount must be greater then or equal to 20"
            };
        }
        const wallet = await coinWalletSchema.findOne({ user: userId});
        console.log('WALLET : ', wallet);
        if (!wallet) {
            console.log('WALLET_NOT FOUND : ', wallet);
            throw {
                status: 400,
                message: "User wallet not found, Please generate coin first."
            };
        }
        if (wallet.coin_balance < amount) {
            console.log('LOW_BALANCE : ', wallet.coin_balance);
            throw {
                status: 400,
                message: "Insufficient balance"
            };
        }
        let convertedCoinIncome = amount * 5;
        console.log('CONVERTED_INCOME : ', convertedCoinIncome);
        let gst = convertedCoinIncome * 20 / 100;
        console.log('GST_AMOUNT : ', gst);
        let incomeAfterGST = convertedCoinIncome - gst;
        console.log('INCOME_AFTER_GST : ', incomeAfterGST);

        const income = await creditIncome(userId, null, incomeAfterGST, IncomeType.COIN_INCOME);
        console.log('INCOME_CREDITED : ', income);
        const coinTransaction = await coinTransactionSchema.create({
            user: userId,
            coin_wallet: wallet._id,
            subscription: null,
            coin: amount,
            transaction_type: Coin.WITHDRAWAL,
            gst: gst,
            final_amount: incomeAfterGST
        });

        wallet.coin_balance -= amount;
        console.log('UPDATED_WALLET_BALANCAE : ', wallet.coin_balance);
        await wallet.save();
        return coinTransaction;
    } catch (error) {
        console.log('WITHDRAW_COIN_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        };
    }
}

async function coinWithdrawlTransaction (userId) {
    try {
        const coinTransaction = await coinTransactionSchema.find({ user: userId, transaction_type: Coin.WITHDRAWAL }).lean().exec();
        return coinTransaction;
    } catch (error) {
        console.log('COIN_WITHDRAWAL_TRANSACTION : ', error);
        throw {
            status: error.status || 500,
            message: error
        };
    }
}

module.exports = { generateCoin, getMining, getUserSubscription, withdrawCoin, coinWithdrawlTransaction }