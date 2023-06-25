const express = require('express');
const app = express();
const { addOtherIncomeAndReward, getOtherIncomeAndReward } = require('./income_rewards.service');
const responseService = require('../../../response/response.handler');

app.post('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        let { 
            direct_income_instant_percent = 0,
            direct_income_daily_percent = 0,
            all_subscription_active_time = 0,
            all_subscription_instant_bonus = 0.0,
            all_subscription_per_day_income = 0.0,
            team_reward_instant_bonus = 0.0
        } = req.body;

        const { user_id } = req.user;
        if (user_id) {
            const result = await addOtherIncomeAndReward(user_id, {
                direct_income_instant_percent,
                direct_income_daily_percent,
                all_subscription_active_time,
                all_subscription_instant_bonus,
                all_subscription_per_day_income,
                team_reward_instant_bonus
            });
            responseService.response(req, null, result, res);
        } else {
            let error = { status: 400, message: "user id is required" }
            responseService.response(req, error, null, res);    
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

app.get('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { user_id } = req.user;
        if (user_id) {
            const result = await getOtherIncomeAndReward();
            responseService.response(req, null, result, res);
        } else {
            let error = { status: 400, message: "user not allowed required" }
            responseService.response(req, error, null, res);    
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

module.exports.incomeRewards = app;