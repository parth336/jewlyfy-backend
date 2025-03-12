// src/api/v1/services/jwt.service.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');
const pool = require('../config/database');
const { AppError } = require('../middleware/error.middleware');

class JwtService {
    async generateTokens(user) {
        try {
            if (!user?.id) {
                logger.error('Invalid user data for token generation');
                throw new AppError('Invalid user data', 400);
            }

            const accessSecret = process.env.JWT_SECRET;
            const refreshSecret = process.env.JWT_REFRESH_SECRET;

            if (!accessSecret || !refreshSecret) {
                logger.error('JWT secrets not configured');
                throw new AppError('Authentication service configuration error', 500);
            }

            // Generate access token
            const accessToken = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role
                },
                accessSecret,
                { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
            );

            // Generate refresh token
            const refreshToken = jwt.sign(
                {
                    userId: user.id,
                    type: 'refresh'
                },
                refreshSecret,
                { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
            );

            // Store refresh token
            await this.storeRefreshToken(user.id, refreshToken);

            logger.info('Tokens generated successfully', {
                userId: user.id
            });

            return {
                accessToken,
                refreshToken,
            };
        } catch (error) {
            logger.error('Token generation failed:', error);
            throw new AppError('Failed to generate authentication tokens', 500);
        }
    }

    async validateToken(token, type = 'access') {
        try {
            if (!token) {
                throw new Error('No token provided');
            }

            const secret = type === 'access'
                ? process.env.JWT_SECRET
                : process.env.JWT_REFRESH_SECRET;

            if (!secret) {
                logger.error(`${type} token secret not configured`);
                throw new Error('Token validation configuration error');
            }

            let decoded;    

            if (type === 'refresh') {
                decoded = await this.validateRefreshToken(token);
            } else {
                decoded = jwt.verify(token, secret);
                console.log(decoded);
            }

            logger.debug('Token validated successfully', {
                userId: decoded.userId,
                tokenType: type
            });

            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                logger.warn('Token expired', { type });
                throw new Error('Token has expired');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                logger.warn('Invalid token', { type });
                throw new Error('Invalid token');
            }
            logger.error('Token validation error:', error);
            throw new Error('Token validation failed');
        }
    }

    async validateRefreshToken(token) {
        try {
            if (!token) {
                throw new AppError('No refresh token provided', 401);
            }

            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            const [tokens] = await pool.query(
                `SELECT * FROM refresh_tokens 
                 WHERE userId = ? AND expiresAt > NOW()
                 ORDER BY createdAt DESC LIMIT 1`,
                [decoded.userId]
            );

            const storedToken = tokens[0];
            if (!storedToken) {
                throw new AppError('Refresh token not found or expired', 401);
            }

            const isValidToken = await bcrypt.compare(token, storedToken.token);
            if (!isValidToken) {
                throw new AppError('Invalid refresh token', 401);
            }

            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                await this.removeExpiredToken(token);
                throw new AppError('Refresh token has expired', 401);
            }
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Refresh token validation failed:', error);
            throw new AppError('Failed to validate refresh token', 401);
        }
    }

    async refreshAccessToken(refreshToken) {
        try {
            const decoded = await this.validateRefreshToken(refreshToken);
            
            const [users] = await pool.query(
                `SELECT 
                    u.id,
                    u.email,
                    r.name as role_name,
                    r.id as role_id,
                    r.description as role_description
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.userId
                LEFT JOIN roles r ON ur.roleId = r.id
                WHERE u.id = ?`,
                [decoded.userId]
            );

            const user = users[0];
            if (!user) {
                throw new AppError('User not found', 404);
            }

            // Generate new tokens
            const tokens = await this.generateTokens(user);
            await this.storeRefreshToken(user.id, tokens.refreshToken);
            return {
                tokens
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Failed to refresh access token:', error);
            throw new AppError('Failed to refresh access token', 500);
        }
    }

    async storeRefreshToken(userId, token) {
        try {
            const hashedToken = await bcrypt.hash(token, 10);
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            const [result] = await pool.query(
                `INSERT INTO refresh_tokens (userId, token, expiresAt, createdAt) 
                 VALUES (?, ?, ?, NOW())
                 ON DUPLICATE KEY UPDATE 
                    token = VALUES(token),
                    expiresAt = VALUES(expiresAt),
                    createdAt = NOW()`,
                [userId, hashedToken, expiresAt]
            );

            logger.debug('Refresh token upserted successfully', { 
                userId,
                operation: result.insertId ? 'inserted' : 'updated'
            });

            return result.insertId || result.updateId;
        } catch (error) {
            logger.error('Failed to store refresh token:', error);
            throw new AppError('Failed to complete authentication process', 500);
        }
    }

    async removeExpiredToken() {
        try {
            await pool.query(
                'DELETE FROM refresh_tokens WHERE expiresAt <= NOW()'
            );
            logger.debug('Expired tokens cleaned up');
        } catch (error) {
            logger.error('Failed to clean up expired tokens:', error);
        }
    }
}

module.exports = new JwtService();
