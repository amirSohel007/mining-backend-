const express = require('express');
const app = express();
const responseService = require('../../response/response.handler');
const { generateCoin, getMining, getUserSubscription } = require('./coin.service');


app.post('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { user_id } = req.user;
        const userSubscription = await getUserSubscription(user_id);
        let result;
        for (let i = 0; i < userSubscription.length; i++) {
            result = await generateCoin(user_id, userSubscription[i].plan);
        }
        responseService.response(req, null, result, res);
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

module.exports.coin = app;