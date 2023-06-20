const express = require('express');
const app = express();
const { loginUser } = require('./login.service');
const responseService = require('../../response/response.handler');

app.post('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}`);
    try {
        if (((req.body && req.body.email !== null && req.body.email !== '')
            || (req.body.my_reffer_code !== null && req.body.my_reffer_code != '' ))
            && req.body.password !== null && req.body.password !== '') {
            
            const result = await loginUser(req.body.email, req.body.my_reffer_code, req.body.password);
            responseService.response(req, null, result, res);
        } else {
            let error = { status: 400, message: "email or password is missing" }
            responseService.response(req, error, null, res);    
        }
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

module.exports.login = app;