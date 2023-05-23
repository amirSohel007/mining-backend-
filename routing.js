module.exports.route = (app) => {
    app.use('/api/user', require('./controllers/user').user);
    app.use('/api/login', require('./controllers/login').login);
}