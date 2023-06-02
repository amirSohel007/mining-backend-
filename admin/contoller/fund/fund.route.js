const express = require('express');
const app = express();
const { changeFundStatus } = require('./fund.service');
const responseService = require('../../../response/response.handler');


app.post('/changestatus',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        changeFundStatus(req.body.userId,req.body.status).then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});

module.exports.fund = app;