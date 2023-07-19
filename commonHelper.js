const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const moment = require('moment-timezone')
moment.tz('Asia/Kolkata');

const Status = {
    ALL : 'ALL',
    ACTIVE : 'ACTIVE',
    INACTIVE : 'INACTIVE'
}

const UserFundStatus = {
    ACCEPT: 'ACCEPT',
    PENDING:'PENDING',
    REJECT:'REJECT',
    ALL:'ALL',
    DEDUCTE: 'FUND_DEDUCTED'
}

const UserRole = {
    USER: 1,
    ADMIN: 0
}

const FundTransactionType = {
    ADD: 'FUND_ADD',
    RECEIVE: 'FUND_RECEIVED',
    SENT: 'FUND_SENT',
    PURCHASE: 'PLAN_PURCHASED'
}

const IncomeType = {
    DAILY: 'DAILY_INCOME',
    INSTANT_DIRECT: '10%_INSTANT_DIRECT_INCOME',
    DAILY_DIRECT: '1.4%_DIRECT_INCOME',
    ALL_PLAN_PURCHASE_REWARD: 'ALL_PLAN_PURCHASE_REWARD',
    DOWN_TEAM_PLAN_PURCHASE_REWARD: 'DOWN_TEAM_PLAN_PURCHASE_REWARD',
    BOOSTING_LEVEL_1: '10%_EXTRA_INCOME',
    BOOSTING_LEVEL_2: '15%_EXTRA_INCOME',
    BOOSTING_LEVEL_3: '20%_EXTRA_INCOME',
    LEVEL_INCOME: [
        { level: 1, text: 'LEVEL_1_INCOME' },
        { level: 2, text: 'LEVEL_2_INCOME' },
        { level: 3, text: 'LEVEL_3_INCOME' },
        { level: 4, text: 'LEVEL_4_INCOME' },
        { level: 5, text: 'LEVEL_5_INCOME' },
        { level: 6, text: 'LEVEL_6_INCOME' },
        { level: 7, text: 'LEVEL_7_INCOME' }
    ] 
}


        // 'LEVEL_1_INCOME',
        // 'LEVEL_2_INCOME',
        // 'LEVEL_3_INCOME',
        // 'LEVEL_4_INCOME',
        // 'LEVEL_5_INCOME',
        // 'LEVEL_6_INCOME',
        // 'LEVEL_7_INCOME',
    

const Coin = {
    DAILY: 'DAILY_COIN_MINING'
}

const getUserIdFromToken = (token) => {
    const tokenUser =  jwt.decode(token);
    return tokenUser?.user_id;

}

const deleteAllDirectoryFiles = async (directoryName = null) => {
    try {
        console.log('DIR_DATA : ', await fs.readdirSync(directoryName));
        for (let file of await fs.readdirSync(directoryName)) {
            console.log('PATH : ', path.join(directoryName, file));
            await fs.unlinkSync(path.join(directoryName, file));
        }
        console.log(`DELETED_FILES_FROM_${directoryName}`);        
    } catch (error) {
        console.log('DELETE_FILES_ERROR : ', error);
    }
}
const getBaseUrl = (req) => {
    if (req.hostname != 'localhost') {
        return `https://hostmarket.in/api/receipt`;
    } else {
        return `${req.protocol}://${req.hostname}:${process.env.NODE_PORT}/api/receipt`;
    }
}

const getQRCode = async () => {
    const dirPath = path.join(__dirname, 'uploads/qr');
    const qrCode = await fs.readdirSync(dirPath);
    console.log('QR_FILE_NAME : ', qrCode);
    return qrCode && qrCode.length ? qrCode[0] : qrCode;
}

const createUploadFolder = () => {
    
    var dir = './uploads/qr';

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
}

const getHours = (startDate, endDate) => {
    const timerStart = moment(startDate, 'DD-MM-YYYY hh:mm:ss a');
    const timerEnd = moment(endDate, 'DD-MM-YYYY hh:mm:ss a');
    const hours = timerEnd.diff(timerStart, 'hours');
    console.log('HOURS : ', hours);
    return hours;
}

module.exports = { 
    Status, 
    UserFundStatus, 
    UserRole, 
    FundTransactionType, 
    IncomeType,
    Coin, 
    getUserIdFromToken, 
    deleteAllDirectoryFiles,
    getBaseUrl,
    createUploadFolder,
    getQRCode,
    getHours
}
