const express = require('express');
const app = express();
const { getUserAndDownlineTeam, getUserAndDirectTeam } = require('../user.service');
const responseService = require('../../../response/response.handler');

app.get('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3001${req.baseUrl}${req.path}`);
    try {
        const { user_id, team_type = 'DIRECT' } = req.query;
        if (user_id && user_id !== null && user_id !== '') {
            let result; 
            if (team_type === 'DOWN') {
                result = await getUserAndDownlineTeam(user_id);
            } else {
                result = await getUserAndDirectTeam(user_id);
            }
            responseService.response(req, null, result, res);
        } else {
            responseService.response(req, { status: 400, message: { status: 400, message: 'user id is missing' } }, null, res);
        }
    } catch (error) {
        console.log('GET_USER_DETAIL_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

module.exports.userteam = app;