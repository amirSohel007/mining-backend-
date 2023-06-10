const jwt = require('jsonwebtoken');

const Status = {
    ALL : 'ALL',
    ACTIVE : 'ACTIVE',
    INACTIVE : 'INACTIVE'
}

const UserFundStatus = {
    ACCEPT: 'ACCEPT',
    PENDING:'PENDING',
    REJECT:'REJECT'
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

module.exports = { Status, UserFundStatus, getUserIdFromToken, UserRole, FundTransactionType }
