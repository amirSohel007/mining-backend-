const express = require('express');
const app = express();
const { getUserAndDownlineTeam, getUserAndDirectTeam } = require('../user.service');
const responseService = require('../../../response/response.handler');

app.get('/', async (req, res) => {
    console.log(`url : ${req.protocol}://${req.hostname}:3001${req.baseUrl}${req.path}, method: ${req.method}`);
    try {
        const { team_type = 'DIRECT' } = req.query;
        if (req.user.user_id) {
            let result; 
            if (team_type === 'DOWN') {
                result = await getUserAndDownlineTeam(req.user.user_id);
            } else {
                result = await getUserAndDirectTeam(req.user.user_id, team_type);
            }
            responseService.response(req, null, result, res);
        } else {
            responseService.response(req, { status: 400, message: { status: 400, message: 'User id is missing' } }, null, res);
        }
    } catch (error) {
        console.log('GET_USER_DETAIL_ERROR : ', error);
        responseService.response(req, error, null, res);
    }
});

module.exports.userteam = app;