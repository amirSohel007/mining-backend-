const jwt = require('jsonwebtoken');
const config = require('../config').config()

const verifyToken = (req, res, next) => {
    const token = req.headers.token;
    if (!token) {
        return res.status(403).json({ status: 403, message: 'token is required for authentication' });
    }

    try {
        const decode = jwt.verify(token, config.jwtSecretKey);
        req.user = decode;
    } catch (error) {
        return res.status(401).json({ status: 401, message: 'invalid token' });
    }

    return next();
}

module.exports = { verifyToken };