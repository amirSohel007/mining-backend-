const local = require('./config/config.local');
const development = require('./config/config.local');
const production = require('./config/config.local');

let config = {
    local: local,
    development: development,
    production: production
}

module.exports = {
    config: () => {
        return config[process.env.NODE_ENV] || local
    }
}
