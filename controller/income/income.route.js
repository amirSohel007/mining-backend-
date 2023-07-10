const express = require('express');
const app = express();
const { withdrawlIncome, creditIncome, getIncome, getIncomeTransaction, getLevelIncome } = require('./income.service');
const responseService = require('../../response/response.handler');

app.post('/withdrawal', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        let { amount } = req.body;
        const { user_id } = req.user;
        if (user_id && amount && amount > 0) {
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

// app.post('/credit', async (req, res) => {
//     console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}, method: ${req.method}`);
//     try {
//         let { amount } = req.body;
//         const { user_id } = req.user;
//         if (user_id && amount && amount > 0) {
//             const result = await creditIncome(user_id, amount);
//             responseService.response(req, null, result, res);
//         } else {
//             let error = { status: 400, message: "user id or amount is required" }
//             responseService.response(req, error, null, res);    
//         }
//     } catch (error) {
//         responseService.response(req, error, null, res);
//     }
// });

app.get('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { user_id } = req.user;
        if (user_id) {
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
    console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { user_id } = req.user;
        if (user_id) {
            const result = await getIncomeTransaction(user_id);
            responseService.response(req, null, result, res);
        } else {
            let error = { status: 400, message: "user id is required" }
            responseService.response(req, error, null, res);    
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

app.get('/down-level-income', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { user_id } = req.user;
        if (user_id) {
            const result = await getLevelIncome(user_id);
            responseService.response(req, null, result, res);
        } else {
            let error = { status: 400, message: "user id is required" }
            responseService.response(req, error, null, res);    
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

module.exports.income = app;