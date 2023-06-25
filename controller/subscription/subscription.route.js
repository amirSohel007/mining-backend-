const express = require('express');
const app = express();
const { subscribePlan, getUserSubscription, getsubscriptionTransactions } = require('./subscription.service');
const responseService = require('../../response/response.handler');

app.post('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        let { plan_id } = req.body;
        const { user_id } = req.user;
        if (plan_id) {
            const result = await subscribePlan(user_id, plan_id);
            responseService.response(req, null, result, res);
        } else {
            let error = { status: 400, message: "plan id is required" }
            responseService.response(req, error, null, res);    
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

app.get('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { user_id } = req.user;
        if (user_id) {
            const result = await getUserSubscription(user_id);
            responseService.response(req, null, result, res);
        } else {
            let error = { status: 400, message: "user id is required" }
            responseService.response(req, error, null, res);    
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

app.get('/income', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { income_type = null } = req.query;
        const { user_id } = req.user;
        if (user_id) {
            const result = await getsubscriptionTransactions(user_id, income_type);
            responseService.response(req, null, result, res);
        } else {
            let error = { status: 400, message: "user id is required" }
            responseService.response(req, error, null, res);    
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

module.exports.subscription = app;