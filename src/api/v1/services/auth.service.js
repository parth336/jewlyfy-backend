// src/api/v1/services/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const UserService = require('./user.service');
const JwtService = require('./jwt.service');

class AuthService {
    constructor() {
        this.userService = UserService;
        this.jwtService = JwtService;
    }

    async register(userData) {
        try {
            // Check if user already exists
            const existingUser = await this.userService.findByEmail(userData.email);
            if (existingUser.data) {
                throw new Error('USER_EXISTS');
            }

            // Create new user
            const result = await this.userService.create(userData);
            
            // Generate tokens
            const { accessToken, refreshToken } = await this.generateTokens(result.data);

            return {
                success: true,
                data: {
                    user: {
                        id: result.data.id,
                        email: result.data.email,
                        role: result.data.role
                    },
                    tokens: {
                        accessToken,
                        refreshToken
                    }
                }
            };
        } catch (error) {
            logger.error('Error in AuthService.register:', error);
            if (error.message === 'USER_EXISTS') {
                throw {
                    success: false,
                    statusCode: 409,
                    message: 'User with this email already exists'
                };
            }
            throw {
                success: false,
                statusCode: 500,
                message: 'Failed to register user',
                error: error.message
            };
        }
    }

    async login(email, password) {
        try {
            // Find user by email
            const user = await this.userService.findByEmail(email);
            if (!user.data) {
                throw new Error('INVALID_CREDENTIALS');
            }

            // Check if account is active
            // if (!user.data.isActive) {
            //     throw new Error('ACCOUNT_DEACTIVATED');
            // }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.data.password);
            if (!isValidPassword) {
                throw new Error('INVALID_CREDENTIALS');
            }

            // Generate tokens
            const { accessToken, refreshToken } = await this.generateTokens(user.data);

            // Update last login
            await this.userService.update(user.data.id, {
                lastLoginAt: new Date()
            });

            return {
                success: true,
                data: {
                    user: {
                        id: user.data.id,
                        email: user.data.email,
                        role: user.data.role
                    },
                    tokens: {
                        accessToken,
                        refreshToken
                    }
                }
            };
        } catch (error) {
            logger.error('Error in AuthService.login:', error);
            if (error.message === 'INVALID_CREDENTIALS') {
                throw {
                    success: false,
                    statusCode: 401,
                    message: 'Invalid email or password'
                };
            }
            if (error.message === 'ACCOUNT_DEACTIVATED') {
                throw {
                    success: false,
                    statusCode: 403,
                    message: 'Account is deactivated'
                };
            }
            throw {
                success: false,
                statusCode: 500,
                message: 'Failed to login',
                error: error.message
            };
        }
    }

    async refreshToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = await this.jwtService.verifyRefreshToken(refreshToken);
            
            // Get user
            const user = await this.userService.findById(decoded.userId);
            if (!user.success) {
                throw new Error('INVALID_TOKEN');
            }

            // Generate new tokens
            const tokens = await this.generateTokens(user.data);

            return {
                success: true,
                data: {
                    tokens
                }
            };
        } catch (error) {
            logger.error('Error in AuthService.refreshToken:', error);
            throw {
                success: false,
                statusCode: 401,
                message: 'Invalid refresh token'
            };
        }
    }

    async logout(userId) {
        try {
            // Here you might want to invalidate the refresh token
            // This depends on your token management strategy
            return {
                success: true,
                message: 'Logged out successfully'
            };
        } catch (error) {
            logger.error('Error in AuthService.logout:', error);
            throw {
                success: false,
                statusCode: 500,
                message: 'Failed to logout',
                error: error.message
            };
        }
    }

    async generateTokens(user) {
        const accessToken = await this.jwtService.generateAccessToken({
            userId: user.id,
            role: user.role
        });

        const refreshToken = await this.jwtService.generateRefreshToken({
            userId: user.id
        });

        return { accessToken, refreshToken };
    }
}

module.exports = new AuthService();
