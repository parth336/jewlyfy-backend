const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        logger.logRequest(req, res, Date.now() - start);
    });

    next();
};

module.exports = requestLogger; 