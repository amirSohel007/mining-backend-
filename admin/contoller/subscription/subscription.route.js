const express = require('express');
const app = express();
const { 
    addSubscriptionPlan, 
    getSubscriptionPlan, 
    activeOrDeactiveSubscriptionPlan, 
    updateSubscriptionPlan, 
    deleteSubscriptionPlan,
    getAllSubscribers 
} = require('./subscription.service');
const responseService = require('../../../response/response.handler');

app.post('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        let { title = null, description, price = 0, daily_income = 0, active = true, plan_id = null,daily_mining_coin = 0.0 } = req.body;
        if (title == null || price == 0, daily_income == 0 || daily_mining_coin == 0) {
            let error = { status: 400, message: "Missing required fields title, price, daily_income, daily_mining_coin" };
            responseService.response(req, error, null, res);
        }
        const { user_id } = req.user;
        if (user_id) {
            if (plan_id) {
                const result = await updateSubscriptionPlan(user_id, plan_id, { title, description, price, active, daily_income, daily_mining_coin });
                responseService.response(req, null, result, res);
            } else {
                const result = await addSubscriptionPlan(user_id, { title, description, price, active, daily_income });
                responseService.response(req, null, result, res);
            }
        } else {
            let error = { status: 401, message: "Only admin user is allowed" };
            responseService.response(req, error, null, res);    
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

app.get('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { plan_id } = req.query;
        const result = await getSubscriptionPlan(plan_id);
        responseService.response(req, null, result, res);
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

app.delete('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { plan_id = null } = req.query;
        const { user_id } = req.user;
        if (plan_id == null) {
            let error = { status: 400, message: "Plan id is missing" };
            responseService.response(req, error, null, res);
        }
        if (user_id) {
            const result = await deleteSubscriptionPlan(plan_id);
            responseService.response(req, null, result, res);
        } else {
            let error = { status: 401, message: "Only admin user is allowed" };
            responseService.response(req, error, null, res); 
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

app.post('/activation', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        let { plan_id = null, active = null } = req.query;
        const { user_id } = req.user;
        if (plan_id == null || active == null) {
            let error = { status: 400, message: "Plan id or active params missing" };
            responseService.response(req, error, null, res);
        } else {
            if (user_id) {
                const result = await activeOrDeactiveSubscriptionPlan(user_id, plan_id, active);
                responseService.response(req, null, result, res);
            } else {
                let error = { status: 401, message: "Only admin user is allowed" };
                responseService.response(req, error, null, res);    
            }
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

module.exports.adminSubscription = app;