const express = require('express');
const app = express();
const { changeIncomeStatus,getAllIncome } = require('./income.service');
const responseService = require('../../../response/response.handler');
const { getUserIdFromToken } = require('../../../commonHelper');
const incomeTransactionSchema = require('../../../controller/income/transaction/incometransaction.model');

app.post('/changestatus',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        changeIncomeStatus(getUserIdFromToken(req.headers.token),req.body.transactionId,req.body.status).then((result) => {
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
  const mockBodyData = {
    id: "64b5755903bb5b1cbea829e1",
    transactionId: "23232323",
  };
    const body = mockBodyData;
    console.log(body)
  // find the document in DB for withdrawal request document
    const data = await incomeTransactionSchema.findOneAndUpdate(
      { _id: body.id },
      {
        $set: {
          payment_type: "ONLINE",
          status: "APPROVED",
          bank_ref_no: "23242",
          client_id: "242323",
          transaction_id: "23242",
          paid_amount: 240,
        },
      }
    );
  res.send(data);
});

module.exports.income = app;