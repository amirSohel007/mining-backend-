module.exports.route = (app) => {
    app.use('/api/registration', require('./controller/user/registration/register.route').register);
    app.use('/api/login', require('./controller/login/login.route').login);
    app.use('/api/user/bank-details', require('./controller/user/bankdetail/bankdetail.route').bankdetail);
}