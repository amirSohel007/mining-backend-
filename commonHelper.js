const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const Status = {
    ALL : 'ALL',
    ACTIVE : 'ACTIVE',
    INACTIVE : 'INACTIVE'
}

const UserFundStatus = {
    ACCEPT: 'ACCEPT',
    PENDING:'PENDING',
    REJECT:'REJECT',
    ALL:'ALL'
}

const UserRole = {
    USER: 1,
    ADMIN: 0
}

const FundTransactionType = {
    ADD: 'FUND_ADD',
    RECEIVE: 'FUND_RECEIVED',
    SENT: 'FUND_SENT'
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
    if (req.hostname = 'localhost') {
        return `https://hostmarket.in/api/api/receipt`;
    } else {
        return `https://hostmarket.in/api/api/receipt`;
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

module.exports = { 
    Status, 
    UserFundStatus, 
    getUserIdFromToken, 
    UserRole, 
    FundTransactionType, 
    deleteAllDirectoryFiles,
    getBaseUrl,
    createUploadFolder,
    getQRCode 
}
