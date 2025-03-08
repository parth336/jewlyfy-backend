// src/config/logger.js
const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
require('fs').mkdirSync(logsDir, { recursive: true });

// Custom format for development
const developmentFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? 
            '\n' + JSON.stringify(meta, null, 2) : '';
        return `${timestamp} ${level}: ${message}${metaStr}`;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: 'debug',
    format: developmentFormat,
    transports: [
        // Console transport with detailed formatting
        new winston.transports.Console(),
        
        // File transport for errors with full stack traces
        new winston.transports.File({ 
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),
        
        // File transport for all logs
        new winston.transports.File({ 
            filename: path.join(logsDir, 'combined.log'),
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ]
});

// Helper methods for structured logging
logger.logRequest = (req, res, duration) => {
    logger.info(`${req.method} ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        query: req.query,
        body: req.body,
        duration: `${duration}ms`,
        userAgent: req.get('user-agent'),
        ip: req.ip
    });
};

logger.logError = (error, req = null) => {
    const errorLog = {
        message: error.message,
        stack: error.stack,
        ...error
    };

    if (req) {
        errorLog.request = {
            method: req.method,
            url: req.originalUrl,
            params: req.params,
            query: req.query,
            body: req.body,
            userAgent: req.get('user-agent'),
            ip: req.ip
        };
    }

    logger.error('Error occurred:', errorLog);
};

logger.logDB = (operation, duration) => {
    logger.debug('Database operation:', {
        operation,
        duration: `${duration}ms`
    });
};

module.exports = logger;
