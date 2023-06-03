const express = require('express');
const app = express();
const { allUsers,changeUserStatus,changeUserPassword,createAdminUser,saveAdminQr,getAdminQr } = require('./user.service');
const responseService = require('../../../response/response.handler');
const { getUserIdFromToken } = require('../../../commonHelper');

app.get('/status/:statusId',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        allUsers(req.params.statusId).then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});

app.post('/changestatus',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        changeUserStatus(req.body.userId,req.body.status).then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});

app.post('/changepassword',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        changeUserPassword(req.body.userId,req.body.password).then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});

app.post('/register',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        createAdminUser({email:req.body.email,password:req.body.password}).then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});

app.post('/qr',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        saveAdminQr(getUserIdFromToken(req.headers.authorization),req.body.qrCode).then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});

app.get('/qr',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        getAdminQr(getUserIdFromToken(req.headers.authorization)).then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});


module.exports.user = app;