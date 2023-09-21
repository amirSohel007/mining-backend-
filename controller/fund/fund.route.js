const express = require('express');
const app = express();
const { addFund, getUserFund, sendFund, getUserFundTransaction } = require('./fund.service');
const { getUserInfo, getUser } = require('../user/user.service');
const responseService = require('../../response/response.handler');
const multer = require('multer');
const axios = require("axios");
const uuid  = require('uuid');
const moment = require('moment-timezone');

//Configuration for Multer
const Stroage = multer.diskStorage({ 
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `${req.user.user_id}_${moment().format('DD-MM-YYYY')}_${moment().get('hours')}_${moment().get('milliseconds')}.${ext}`);
    } 
});

const upload = multer({storage : Stroage}).single('image');

app.post('/', upload, async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3001${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const data = req.body;
        const { user_id } = req.user;
        if (data && !data.transaction_no) {
            responseService.response(req, { status: 400, message: { status: 400, message: "Transaction number is missing" } }, null, res);
        } else {
            if (data && user_id) {
                if (data.amount && data.amount > 0) {
                    let user = await getUserInfo(user_id);
                    if (user && !user.message) {
                        const result = await addFund(user_id, data, 'FUND_ADD', req.file.filename);
                        responseService.response(req, null, result, res);
                    } else {
                        responseService.response(req, { status: 400, message: { status: 400, message: "Sender dose not exist" } }, null, res);
                    }
                } else {
                    responseService.response(req, { status: 400, message: { status: 400, message: "Amount can't be 0" } }, null, res);
                }
            } else {
                responseService.response(req, { status: 400, message: { status: 400, message: 'User id is missing' } }, null, res);
            }
        }
    } catch (error) {
        console.log('ADD_FUND_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

app.get('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3001${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { user_id } = req.user;
        if (user_id) {
            const result = await getUserFund(user_id);
            responseService.response(req, null, result, res);
        } else {
            responseService.response(req, { status: 400, message: { status: 400, message: 'User id is missing' } }, null, res);
        }
    } catch (error) {
        console.log('GET_FUND_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

app.get('/history', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3001${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { fund_request_type } = req.query;
        const { user_id } = req.user;
        if (user_id) {
            const result = await getUserFundTransaction(user_id, fund_request_type, req);
            responseService.response(req, null, result, res);
        } else {
            responseService.response(req, { status: 400, message: { status: 400, message: 'User id is missing' } }, null, res);
        }
    } catch (error) {
        console.log('GET_FUND_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

app.post('/send', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3001${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { receiver_id, amount = 0 } = req.body;
        const { user_id } = req.user;
        if (user_id && receiver_id) {
            if (amount > 0) {
                const receiver = await getUser({ my_reffer_code: receiver_id });
                const sender = await getUser({ _id: user_id });
                if (receiver && receiver._id.toString() === user_id) {
                    responseService.response(req, { status: 400, message: { status: 400, message: "Self fund transfer is prohibited" } }, null, res);    
                } else if (receiver && receiver.message) {
                    responseService.response(req, { status: 400, message: { status: 400, message: "Fund receiver is not exists" } }, null, res);    
                } else if (sender && sender.message) {
                    responseService.response(req, { status: 400, message: { status: 400, message: "Fund sender is not exists" } }, null, res);    
                } else {
                    const result = await sendFund(user_id, receiver._id, amount);
                    responseService.response(req, null, result, res);
                }
            } else {
                responseService.response(req, { status: 400, message: { status: 400, message: "Amount can't not be 0" } }, null, res);    
            }
        } else {
            responseService.response(req, { status: 400, message: { status: 400, message: 'User id or receiver id is missing' } }, null, res);
        }
    } catch (error) {
        console.log('ADD_FUND_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

app.post("/payout", async (req, res) => {
  try {
    const { payout_details } = req.body || {};
    const {data} = await axios.post("https://ignwallet.com/API/Payout", payout_details);
    res.send(data);
  } catch (error) {
      console.log(error.message)
  }
});

module.exports.fund = app; 