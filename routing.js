const { verifyToken } = require('./middleware/auth');

module.exports.route = (app) => {
    app.use('/api/registration', require('./controller/user/registration/register.route').register);
    app.use('/api/login', require('./controller/login/login.route').login);
    app.use('/api/change-password', require('./controller/change_password/password.route').changePassword);
    app.use('/api/user/bank-details', verifyToken, require('./controller/user/bankdetail/bankdetail.route').bankdetail);
    app.use('/api/user/user-info', verifyToken, require('./controller/user/userdetail/userdetail.route').userdetail);
}