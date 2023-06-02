const express = require('express');
const app = express();
const { getUserInfo, updateUserDetails } = require('../user.service');
const responseService = require('../../../response/response.handler');

app.get('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { user_id } = req.user;
        if (user_id) {
            const result = await getUserInfo(user_id);
            responseService.response(req, null, result, res);
        } else {
            responseService.response(req, { status: 400, message: { status: 400, message: 'user id is missing' } }, null, res);
        }
    } catch (error) {
        console.log('GET_USER_DETAIL_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

app.post('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { user_id } = req.user;
        if (user_id) {
            const result = await updateUserDetails({ _id: user_id }, req.body);
            responseService.response(req, null, result, res);
        } else {
            responseService.response(req, { status: 400, message: { status: 400, message: 'user id is missing' } }, null, res);
        }
    } catch (error) {
        console.log('UPDATE_USER_DETAIL_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

module.exports.userdetail = app;