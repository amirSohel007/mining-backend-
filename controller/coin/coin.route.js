const express = require('express');
const app = express();
const responseService = require('../../response/response.handler');
const { generateCoin, getMining, getUserSubscription, withdrawCoin, coinWithdrawlTransaction, getCoinWallet } = require('./coin.service');


app.post('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { user_id } = req.user;
        const userSubscription = await getUserSubscription(user_id);
        const coinWallet = await getCoinWallet(user_id);
        if (coinWallet && coinWallet.mining_open === false) {
            responseService.response(req, { status: 400, message: { status: 400, message: 'User is allowed to mine coin once in a day, Please try later.' } }, null, res);
        } else {
            let result;
            for (let i = 0; i < userSubscription.length; i++) {
                result = await generateCoin(user_id, userSubscription[i].plan);
            }
            coinWallet.mining_open = false;
            await coinWallet.save();
            responseService.response(req, null, result, res);
        }
    } catch (error) {
        console.log('ADD_FUND_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

app.get('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { user_id } = req.user;
        if (user_id) {
            const result = await getMining(user_id);
            responseService.response(req, null, result, res);
        } else {
            responseService.response(req, { status: 400, message: { status: 400, message: 'User id is missing' } }, null, res);
        }
    } catch (error) {
        console.log('GET_FUND_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

app.post('/withdraw', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { user_id } = req.user;
        const { amount } = req.body;
        const transaction = await withdrawCoin(user_id, amount);
        responseService.response(req, null, transaction, res);
    } catch (error) {
        console.log('WITHDRAW_COIN_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

app.get('/withdraw/transaction', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { user_id } = req.user;
        const transaction = await coinWithdrawlTransaction(user_id);
        responseService.response(req, null, transaction, res);
    } catch (error) {
        console.log('WITHDRAW_COIN_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

module.exports.coin = app;