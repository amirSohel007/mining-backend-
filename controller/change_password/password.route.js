const express = require('express');
const app = express();
const { changePassword } = require('./password.service');
const responseService = require('../../response/response.handler');

app.post('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3001${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { old_password, new_password } = req.body;
        const { user_id } = req.user;
        if (user_id && old_password !== null && old_password !== '' && new_password !== null && new_password !== '') {
            const result = await changePassword(user_id, old_password, new_password);
            console.log('BANK : ', result);
            responseService.response(req, null, result, res);
        } else {
            let error = { status: 400, message: "Required field is missing" }
            responseService.response(req, error, null, res);    
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

module.exports.changePassword = app;