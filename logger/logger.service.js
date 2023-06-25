const pino = require('pino');

function logger (title, message) { 
    const logger = pino({ level: title });
    logger.info(message)
}

module.exports = logger;