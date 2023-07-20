const express = require('express');
const app = express();
const { createUser } = require('./registration.service');
const responseService = require('../../../response/response.handler');

app.post('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:${process.env.NODE_PORT}${req.baseUrl}${req.path}`);
    try {
        const result = await createUser(req.body);
        responseService.response(req, null, result, res);
    } catch (error) {
        responseService.response(req, error, null, res);
    }
});

module.exports.register = app;