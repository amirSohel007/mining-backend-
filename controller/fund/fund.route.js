const express = require('express');
const app = express();
const { addFund, getUserFund, sendFund, getUserFundTransaction } = require('./fund.service');
const { getUserInfo } = require('../user/user.service');
const responseService = require('../../response/response.handler');

app.post('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3001${req.baseUrl}${req.path}`);
    try {
        const data = req.body;
        if (data && data.user_id && data.user_id !== null && data.user_id !== '') {
            if (data.amount && data.amount > 0) {
                let user = await getUserInfo(data.user_id);
                if (user && !user.message) {
                    const result = await addFund(data.user_id, data, 'FUND_ADD');
                    responseService.response(req, null, result, res);
                } else {
                    responseService.response(req, { status: 400, message: { status: 400, message: "sender dose not exist" } }, null, res);
                }
            } else {
                responseService.response(req, { status: 400, message: { status: 400, message: "amount can't be 0" } }, null, res);
            }
        } else {
            responseService.response(req, { status: 400, message: { status: 400, message: 'user id is missing' } }, null, res);
        }
    } catch (error) {
        console.log('ADD_FUND_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

app.get('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3001${req.baseUrl}${req.path}`);
    try {
        const { user_id } = req.query;
        if (user_id && user_id !== null && user_id !== '') {
            const result = await getUserFund(user_id);
            responseService.response(req, null, result, res);
        } else {
            responseService.response(req, { status: 400, message: { status: 400, message: 'user id is missing' } }, null, res);
        }
    } catch (error) {
        console.log('GET_FUND_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

app.get('/history', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3001${req.baseUrl}${req.path}`);
    try {
        const { user_id, fund_request_type } = req.query;
        if (user_id && user_id !== null && user_id !== '') {
            const result = await getUserFundTransaction(user_id, fund_request_type);
            responseService.response(req, null, result, res);
        } else {
            responseService.response(req, { status: 400, message: { status: 400, message: 'user id is missing' } }, null, res);
        }
    } catch (error) {
        console.log('GET_FUND_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

app.post('/send', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3001${req.baseUrl}${req.path}`);
    try {
        const { user_id, receiver_id, amount = 0 } = req.body;
        if (user_id && user_id !== null && user_id !== '' && receiver_id) {
            if (amount > 0) {
                const receiver = await getUserInfo(receiver_id);
                const sender = await getUserInfo(user_id);
                if (receiver && receiver.message) {
                    responseService.response(req, { status: 400, message: { status: 400, message: "fund receiver is not exists" } }, null, res);    
                } else if (sender && sender.message) {
                    responseService.response(req, { status: 400, message: { status: 400, message: "fund sender is not exists" } }, null, res);    
                } else {
                    const result = await sendFund(user_id, receiver_id, amount);
                    responseService.response(req, null, result, res);
                }
            } else {
                responseService.response(req, { status: 400, message: { status: 400, message: "amount can't not be 0" } }, null, res);    
            }
        } else {
            responseService.response(req, { status: 400, message: { status: 400, message: 'user id or receiver id is missing' } }, null, res);
        }
    } catch (error) {
        console.log('ADD_FUND_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

module.exports.fund = app;