const express = require('express');
const app = express();
const { createOrUpdateBankDetail, getBankDetail } = require('./bankdetail.service');
const responseService = require('../../../response/response.handler');

app.post('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const data = req.body;
        if (req.user.user_id) {
            data.user_id = req.user.user_id;
            const result = await createOrUpdateBankDetail(req.body);
            responseService.response(req, null, result, res);
        } else {
            responseService.response(req, { status: 400, message: 'User id is missing' }, null, res);
        }
    } catch (error) {
        console.log('BANK_DETAIL_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

app.get('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { user_id } = req.user;
        if (user_id) {
            const result = await getBankDetail(user_id);
            responseService.response(req, null, result, res);
        } else {
            responseService.response(req, { status: 400, message: 'User id is missing' }, null, res);
        }
    } catch (error) {
        console.log('BANK_DETAIL_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

module.exports.bankdetail = app;