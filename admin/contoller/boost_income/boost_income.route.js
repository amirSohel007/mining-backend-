const express = require('express');
const app = express();
const { addBoostIncomeDetails, getAllBootIncomeDetails } = require('./boost_income.service');
const responseService = require('../../../response/response.handler');

app.post('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        let {
            dboost_income_id = null, 
            duration_hours = 0,
            direct_team_count = 0,
            extra_income_percentage = 0
        } = req.body;

        const { user_id } = req.user;
        if (user_id) {
            const result = await addBoostIncomeDetails(user_id, dboost_income_id, {
                duration_hours,
                direct_team_count,
                extra_income_percentage,
                created_by: user_id
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
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { user_id } = req.user;
        const { boost_income_id = null } = req.query;
        if (user_id) {
            let query = {};
            if (boost_income_id) {
                query = { _id: boost_income_id };
            }
            const result = await getAllBootIncomeDetails(query);
            responseService.response(req, null, result, res);
        } else {
            let error = { status: 400, message: "user not allowed required" }
            responseService.response(req, error, null, res);    
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

module.exports.boostIncome = app;