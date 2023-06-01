const express = require('express');
const app = express();
const { allUsers } = require('./user.service');
const responseService = require('../../../response/response.handler');

app.get('/status/:statusId',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        allUsers(req.params.statusId).then((data) => {
            responseService.response(req, null, result, data);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});

module.exports.user = app;