// src/config/logger.js
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
try {
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true, mode: 0o755 });
    }
} catch (error) {
    console.error('Error creating logs directory:', error);
    // Fallback to console-only logging if directory creation fails
}

// Custom format for development
const developmentFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = '';
        if (Object.keys(meta).length) {
            try {
                metaStr = '\n' + JSON.stringify(meta, null, 2);
            } catch (error) {
                metaStr = '\n[Error serializing metadata]';
            }
        }
        return `${timestamp} ${level}: ${message}${metaStr}`;
    })
);

// Create transports array
const transports = [
    // Console transport with detailed formatting
    new winston.transports.Console()
];

// Add file transports if directory exists
if (fs.existsSync(logsDir)) {
    transports.push(
        // File transport for errors with full stack traces
        new winston.transports.File({ 
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),
        
        // File transport for all logs
        new winston.transports.File({ 
            filename: path.join(logsDir, 'combined.log'),
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        })
    );
}

// Create logger instance
const logger = winston.createLogger({
    level: 'debug',
    format: developmentFormat,
    transports,
    // Handle errors in logging
    exceptionHandlers: [
        new winston.transports.Console(),
        ...(fs.existsSync(logsDir) ? [
            new winston.transports.File({ 
                filename: path.join(logsDir, 'exceptions.log'),
                maxsize: 5242880, // 5MB
                maxFiles: 5
            })
        ] : [])
    ],
    // Prevent winston from exiting on uncaught exceptions
    exitOnError: false
});

// Helper methods for structured logging
logger.logRequest = (req, res, duration) => {
    try {
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
    } catch (error) {
        logger.error('Error logging request:', error);
    }
};

logger.logError = (error, req = null) => {
    try {
        const errorLog = {
            message: error.message,
            stack: error.stack,
            ...(typeof error === 'object' ? error : { error })
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
    } catch (error) {
        logger.error('Error in error logging:', error);
    }
};

logger.logDB = (operation, duration) => {
    try {
        logger.debug('Database operation:', {
            operation,
            duration: `${duration}ms`
        });
    } catch (error) {
        logger.error('Error logging DB operation:', error);
    }
};

module.exports = logger;
