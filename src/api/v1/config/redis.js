const Redis = require('ioredis');
const logger = require('./logger');

class RedisClient {
    constructor() {
        this.client = null;
        this.isEnabled = process.env.REDIS_ENABLED === 'true';
    }

    connect() {
        if (!this.isEnabled) {
            logger.info('Redis is disabled. Skipping connection.');
            return null;
        }

        try {
            this.client = new Redis({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD,
                lazyConnect: true, // Don't connect immediately
                retryStrategy: (times) => {
                    const delay = Math.min(times * 500, 2000);
                    logger.warn(`Retrying Redis connection... Attempt ${times}. Next retry in ${delay}ms`);
                    return delay;
                }
            });

            this.client.on('error', (error) => {
                logger.error('Redis connection error:', {
                    error: error.message,
                    stack: error.stack
                });
            });

            return this.client;
        } catch (error) {
            logger.error('Redis initialization error:', error);
            return null;
        }
    }

    getClient() {
        if (!this.isEnabled) {
            return {
                get: async () => null,
                set: async () => null,
                setex: async () => null,
                del: async () => null,
                flushall: async () => null
            };
        }

        if (!this.client) {
            this.connect();
        }
        return this.client;
    }
}

// Create and export a singleton instance
const redisClient = new RedisClient();
module.exports = redisClient.getClient(); 