const express = require('express');
const app = express();
const { changeFundStatus,getAllFunds } = require('./fund.service');
const responseService = require('../../../response/response.handler');
const { getUserIdFromToken } = require('../../../commonHelper');


app.post('/changestatus',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        changeFundStatus(getUserIdFromToken(req.headers.token),req.body.transactionId,req.body.status).then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});

app.get('/:status',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        getAllFunds(req.params.status, req).then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});

module.exports.fund = app;