const express = require('express');
const app = express();
const { getAllUsersBankDetails,resetUserBankDetails } = require('./bank.service');
const responseService = require('../../../response/response.handler');

app.get('/bankdetails',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        getAllUsersBankDetails().then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});

app.post('/resetbankdetails',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        resetUserBankDetails(req.body).then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});



module.exports.bankDetails = app;