const { verifyToken } = require('./middleware/auth');
const express = require('express');
const path = require('path');

module.exports.route = (app) => {
    app.use('/api/registration', require('./controller/user/registration/register.route').register);
    app.use('/api/admin/register', require('./admin/contoller/user/registration.route').adminRegister);
    app.use('/api/login', require('./controller/login/login.route').login);
    app.use('/api/change-password', verifyToken, require('./controller/change_password/password.route').changePassword);
    app.use('/api/user/bank-details', verifyToken, require('./controller/user/bankdetail/bankdetail.route').bankdetail);
    app.use('/api/user/user-info', verifyToken, require('./controller/user/userdetail/userdetail.route').userdetail);
    app.use('/api/user/fund', verifyToken, require('./controller/fund/fund.route').fund);
    app.use('/api/user/team', verifyToken, require('./controller/user/team/team.route').userteam);
    app.use('/api/income', verifyToken, require('./controller/income/income.route').income);
    app.use('/api/admin/user',verifyToken,require('./admin/contoller/user/user.route').user);
    app.use('/api/admin/fund',verifyToken,require('./admin/contoller/fund/fund.route').fund);
    app.use('/api/admin/income',verifyToken,require('./admin/contoller/income/income.route').income);
    app.use('/api/admin/bank',verifyToken,require('./admin/contoller/bank_details/bank.route').bankDetails);
    app.use('/api/receipt', express.static(path.join(__dirname, 'uploads')));
    app.use('/api/qr', express.static(path.join(__dirname, 'uploads/qr')));
    app.use('/api/subscription', verifyToken, require('./controller/subscription/subscription.route').subscription);
    app.use('/api/admin/subscription', verifyToken, require('./admin/contoller/subscription/subscription.route').adminSubscription);
    app.use('/api/admin/income-reward', verifyToken, require('./admin/contoller/other_income_and_rewards/income_rewards.route').incomeRewards);
    app.use('/api/admin/boosting-income', verifyToken, require('./admin/contoller/boost_income/boost_income.route').boostIncome);
}