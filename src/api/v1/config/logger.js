// src/config/logger.js
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
try {
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
} catch (error) {
    console.error('Error creating logs directory:', error);
}

// Simple format for all logs
const simpleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} ${level}: ${message}`;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: 'debug',
    format: simpleFormat,
    transports: [
        // Console logging
        new winston.transports.Console(),
        // File logging
        new winston.transports.File({ 
            filename: path.join(logsDir, 'app.log')
        })
    ]
});

// Helper methods for structured logging
logger.logRequest = (req, res, duration) => {
    logger.info(`${req.method} ${req.originalUrl} - ${duration}ms`);
};

logger.logError = (error, req = null) => {
    const message = req ? 
        `Error at ${req.method} ${req.originalUrl}: ${error.message}` :
        `Error: ${error.message}`;
    logger.error(message);
};

logger.logDB = (operation, duration) => {
    logger.debug(`DB ${operation} - ${duration}ms`);
};

module.exports = logger;
