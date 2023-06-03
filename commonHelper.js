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

const getUserIdFromToken = (token) => {
    const tokenUser =  jwt.decode(token.replace('Bearer ','').trim());
    return tokenUser?.user_id;

} 

module.exports = { Status,UserFundStatus,getUserIdFromToken ,UserRole}
