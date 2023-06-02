const { verifyToken } = require('./middleware/auth');

module.exports.route = (app) => {
    app.use('/api/registration', require('./controller/user/registration/register.route').register);
    app.use('/api/login', require('./controller/login/login.route').login);
    app.use('/api/change-password', verifyToken, require('./controller/change_password/password.route').changePassword);
    app.use('/api/user/bank-details', verifyToken, require('./controller/user/bankdetail/bankdetail.route').bankdetail);
    app.use('/api/user/user-info', verifyToken, require('./controller/user/userdetail/userdetail.route').userdetail);
    app.use('/api/user/fund', verifyToken, require('./controller/fund/fund.route').fund);
    app.use('/api/user/team', verifyToken, require('./controller/user/team/team.route').userteam);
    app.use('/api/income', verifyToken, require('./controller/income/income.route').income);
    app.use('/api/admin',require('./admin/contoller/user/user.route').user);
    app.use('/api/admin',require('./admin/contoller/fund/fund.route').fund);
    app.use('/api/admin',require('./admin/contoller/income/income.route').income);
}