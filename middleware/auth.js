const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers.token;
    console.log('HEADERS : ', req.headers);
    if (!token) {
        return res.status(403).json({ message: 'token is required for authentication' });
    }

    try {
        const decode = jwt.verify(token, 'thisissecretkey');
        req.user = decode;
    } catch (error) {
        console.log('INVALID TOKEN');
        return res.status(401).json({ message: 'invalid token' });
    }

    return next();
}

module.exports = { verifyToken };