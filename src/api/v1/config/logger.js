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

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
};

// Add colors to Winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}${info.data ? ' - ' + JSON.stringify(info.data) : ''}`
    )
);

// Define which logs to print based on environment
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' ? 'debug' : 'warn';
};

// Create separate transports for different types of logs
const transports = [
    // Console transport
    new winston.transports.Console(),
    
    // Error log file
    new winston.transports.File({
        filename: path.join(__dirname, '../../../../logs/error.log'),
        level: 'error',
    }),
    
    // All logs file
    new winston.transports.File({
        filename: path.join(__dirname, '../../../../logs/combined.log'),
    }),
];

// Create the logger
const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
});

// Create standardized logging functions
const standardLogger = {
    error: (message, data = {}) => {
        logger.error(message, { data });
    },

    warn: (message, data = {}) => {
        logger.warn(message, { data });
    },

    info: (message, data = {}) => {
        logger.info(message, { data });
    },

    debug: (message, data = {}) => {
        logger.debug(message, { data });
    },

    http: (message, data = {}) => {
        logger.http(message, { data });
    },

    // Specific logging functions for common scenarios
    logRequest: (req, res, duration) => {
        logger.http('API Request', {
            method: req.method,
            path: req.path,
            duration: `${duration}ms`,
            status: res.statusCode,
            userIP: req.ip,
            userId: req.user?.id
        });
    },

    logDB: (operation, duration, query = '') => {
        logger.debug('Database Operation', {
            operation,
            duration: `${duration}ms`,
            query: query.replace(/\s+/g, ' ').trim()
        });
    },

    logAuth: (action, userId, success, details = {}) => {
        const level = success ? 'info' : 'warn';
        logger[level](`Authentication ${action}`, {
            userId,
            success,
            ...details
        });
    }
};

module.exports = standardLogger;
