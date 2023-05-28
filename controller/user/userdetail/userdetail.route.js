const express = require('express');
const app = express();
const { getUserInfo } = require('../user.service');
const responseService = require('../../../response/response.handler');

app.get('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
    try {
        const { user_id } = req.query;
        if (user_id && user_id !== null && user_id !== '') {
            const result = await getUserInfo(user_id);
            responseService.response(req, null, result, res);
        } else {
            responseService.response(req, { status: 400, message: 'user id is missing' }, null, res);
        }
    } catch (error) {
        console.log('USER_DETAIL_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

module.exports.userdetail = app;