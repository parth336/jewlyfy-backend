// src/api/v1/services/auth.service.js
const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
const logger = require('../config/logger');
const crypto = require('crypto');
const UserService = require('./user.service');
const JwtService = require('./jwt.service');
const { AppError } = require('../middleware/error.middleware');
const emailService = require('../../../utils/emailService');

class AuthService {
constructor() {
    this.userService = UserService;
    this.jwtService = JwtService;
}

async register(userData) {
    try {
        logger.debug('Starting user registration', { email: userData.email });

        if (!userData.email || !userData.password) {
            logger.warn('Registration attempt with missing data', {
                hasEmail: !!userData.email,
                hasPassword: !!userData.password
            });
            throw new AppError('Email and password are required', 400);
        }

        const existingUser = await userModel.findByEmail(userData.email);
        if (existingUser) {
            logger.warn('Registration attempt with existing email', {
                email: userData.email
            });
            throw new AppError('User with this email already exists', 409);
        }

        const otp = crypto.randomInt(100000, 999999).toString(); // OTP between 100000 and 999999
        const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const result = await userModel.create({
            email: userData.email,
            password: hashedPassword,
            otp: otp,
            otp_expiration: otpExpiration
        });

        // Send OTP email
        await sendEmail(result.email, otp);

        logger.logAuth('registration', result.id, true, {
            email: result.email
        });

        return {
            id: result.id,
            email: result.email
        };
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        logger.error('Registration failed', {
            error: error.message,
            stack: error.stack
        });
        throw new AppError('Registration failed', 500);
    }
}

async createUser(userData) {
    try {
        logger.debug('Starting user creation', { email: userData.email });

        if (!userData.email ) {
            logger.warn('User creation attempt with missing data', {
                hasEmail: !!userData.email,
            });
            throw new AppError('Email is required', 400);
        }

        const existingUser = await userModel.findByEmail(userData.email);
        if (existingUser) {
            logger.warn('User creation attempt with existing email', {
                email: userData.email
            });
            throw new AppError('User with this email already exists', 409);
        }

        const result = await userModel.create(userData);
        logger.logAuth('user creation', result.id, true, {
            email: result.email
        });

        await userModel.assignRole(result.id, 1);
        // Generate reset token
        const {resetToken }= await this.jwtService.generateResetToken({id: result.id});

        // Create reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Send password reset email
        await emailService.sendPasswordResetEmail(
            userData.email,
            resetLink,
            userData.firstName // optional
        );

        return result;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        logger.error('User creation failed', { error: error.message });
        throw new AppError('User creation failed', 500);
    }   
}   

async login(email, password) {
    try {
        logger.debug('Login attempt', { email });

        if (!email || !password) {
            logger.warn('Login attempt with missing credentials', {
                hasEmail: !!email,
                hasPassword: !!password
            });
            throw new AppError('Email and password are required', 400);
        }

        const user = await userModel.findByEmail(email);
        
        if (!user) {
            logger.warn('Login attempt with non-existent email', { email });
            throw new AppError('Invalid email or password', 401);
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            logger.warn('Invalid password attempt', { 
                userId: user.id,
                email: user.email 
            });
            throw new AppError('Invalid email or password', 401);
        }

        const tokens = await this.jwtService.generateTokens(user);

        logger.logAuth('login', user.id, true, {
            email: user.email,
            role: user.role_name
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role_name
            },
            ...tokens
        };
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        logger.error('Login failed', {
            error: error.message,
            stack: error.stack
        });
        throw new AppError('Authentication failed', 500);
    }
}


async refreshAccessToken(refreshToken) {
    try {
        return await this.jwtService.refreshAccessToken(refreshToken);
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        logger.error('Token refresh failed:', error);
        throw new AppError('Failed to refresh access token', 500);
    }
}

async revokeUserTokens(userId) {
    try {
        await this.jwtService.removeExpiredToken();
        logger.info('User tokens revoked', { userId });
    } catch (error) {
        logger.error('Failed to revoke user tokens:', error);
        throw new AppError('Failed to revoke user tokens', 500);
    }
}
}

module.exports = new AuthService();
