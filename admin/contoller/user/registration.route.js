const express = require('express');
const app = express();
const { createAdminUser } = require('./user.service');
const responseService = require('../../../response/response.handler');

app.post('/',(req,res) => {
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

module.exports.adminRegister = app;