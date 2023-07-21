const express = require('express');
const app = express();
const { changeIncomeStatus, getAllIncome, onlineWithdrawal } = require('./income.service');
const responseService = require('../../../response/response.handler');
const { getUserIdFromToken } = require('../../../commonHelper');
const incomeTransactionSchema = require('../../../controller/income/transaction/incometransaction.model');

app.post('/changestatus',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        changeIncomeStatus(getUserIdFromToken(req.headers.token),req.body.transactionId, req.body.status).then((result) => {
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
        getAllIncome(req.params.status).then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});

app.post("/pay-online", async (req, res) => {
  try {
    const { transactionId, status, payment_details } = req.body;
    console.log(body);
    const { user_id } = req.user;
    const result = await onlineWithdrawal(user_id, transactionId, status, payment_details);
    responseService.response(req, null, result, res);
  } catch (error) {
    console.log('PAY_ONLINE_ERROR : ', error);
    responseService.response(req, error, null, res);
  }
});

module.exports.income = app;