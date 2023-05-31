const express = require('express');
const app = express();
const { withdrawlIncome, creditIncome, getIncome, getIncomeTransaction } = require('./income.service');
const responseService = require('../../response/response.handler');

app.post('/withdrawal', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
    try {
        let { user_id, amount } = req.body;
        if (user_id && user_id != null && user_id != '' && amount && amount > 0) {
            const result = await withdrawlIncome(user_id, amount);
            responseService.response(req, null, result, res);
        } else {
            let error = { status: 400, message: "user id or amount is required" }
            responseService.response(req, error, null, res);    
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

app.post('/credit', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
    try {
        let { user_id, amount } = req.body;
        if (user_id && user_id != null && user_id != '' && amount && amount > 0) {
            const result = await creditIncome(user_id, amount);
            responseService.response(req, null, result, res);
        } else {
            let error = { status: 400, message: "user id or amount is required" }
            responseService.response(req, error, null, res);    
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

app.get('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
    try {
        let { user_id, amount } = req.query;
        if (user_id && user_id != null && user_id != '' && amount && amount > 0) {
            const result = await getIncome(user_id);
            responseService.response(req, null, result, res);
        } else {
            let error = { status: 400, message: "user id or amount is required" }
            responseService.response(req, error, null, res);    
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

app.get('/history', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
    try {
        let { user_id, amount } = req.query;
        if (user_id && user_id != null && user_id != '' && amount && amount > 0) {
            const result = await getIncomeTransaction(user_id);
            responseService.response(req, null, result, res);
        } else {
            let error = { status: 400, message: "user id or amount is required" }
            responseService.response(req, error, null, res);    
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

module.exports.income = app;