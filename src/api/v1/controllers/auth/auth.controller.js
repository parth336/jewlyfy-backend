// src/api/v1/controllers/auth.controller.js
const authService = require('../../services/auth.service');
const ApiResponse = require('../../../../utils/apiResponse');
const { AppError } = require('../../middleware/error.middleware');
const logger = require('../../config/logger');
const jwtService = require('../../services/jwt.service');
const User = require('../../models/user.model');
const crypto = require('crypto');
const { sendOTPEmail } = require('../../../../utils/emailService');
const userModel = require('../../models/user.model');

class AuthController {
    constructor() {
        this.authService = authService;
    }

    async register(req, res, next) {
        try {
            const result = await this.authService.register(req.body);
            res.status(201).json(
                ApiResponse.success(
                    'User registered successfully',
                    {
                        user: {
                            id: result.id,
                            email: result.email
                        }
                    },
                    201
                )
            );
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json(
                    ApiResponse.error(error.message, error.statusCode, error.errors)
                );
            }
            next(error);
        }
    }

    async createUser(req, res, next) {
        try {
            const result = await this.authService.createUser(req.body);
            res.status(201).json(
                ApiResponse.success(
                    'User created successfully',
                    result
                )
            );
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json(
                    ApiResponse.error(error.message, error.statusCode, error.errors)
                );
            }
            next(error);
        }
    }   

    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Validate request body
            if (!email || !password) {
                return res.status(400).json(
                    ApiResponse.error('Email and password are required', 400)
                );
            }

            const result = await this.authService.login(email, password);
            
            return res.status(200).json(
                ApiResponse.success(
                    'Login successful',
                    {
                        user: result.user,
                        tokens: {
                            accessToken: result.accessToken,
                            refreshToken: result.refreshToken,
                            expiresIn: result.expiresIn
                        }
                    }
                )
            );
        } catch (error) {
            if (error instanceof AppError) {
                // Handle specific error cases
                return res.status(error.statusCode).json(
                    ApiResponse.error(
                        error.message,
                        error.statusCode,
                        error.errors
                    )
                );
            }
            // Handle unexpected errors
            logger.error('Login controller error:', error);
            return res.status(500).json(
                ApiResponse.error('An unexpected error occurred', 500)
            );
        }
    }

    async logout(req, res, next) {
        try {
            await this.authService.revokeUserTokens(req.user.id);
            res.status(200).json(
                ApiResponse.success('Logged out successfully')
            );
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json(
                    ApiResponse.error(error.message, error.statusCode)
                );
            }
            next(error);
        }
    }

    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await this.authService.refreshAccessToken(refreshToken);
            res.status(200).json(
                ApiResponse.success(
                    'Access token refreshed successfully',
                    {
                        accessToken: result.accessToken,
                        expiresIn: result.expiresIn
                    }
                )
            );
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json(
                    ApiResponse.error(error.message, error.statusCode)
                );
            }
            next(error);
        }
    }

    async validateToken(req, res) {
        try {
            const { token, type } = req.body;
            const isValid = await jwtService.validateToken(token, type);
            res.json({
                status: 'success',
                data: isValid
            });
        } catch (error) {
            logger.error(`Token validation failed: ${error.message}`);
            res.status(401).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async verifyOTP(req, res) {
        try {
            const { email, otp } = req.body;

            // Validate input
            if (!email || !otp) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and OTP are required'
                });
            }

            // Find user by email
            const user = await userModel.findByEmail(email);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (user.isEmailVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already verified'
                });
            }

            // Check if OTP is expired
            if (new Date() > user.otpExpiresAt) {
                return res.status(400).json({
                    success: false,
                    message: 'OTP has expired'
                });
            }

            // Verify OTP
            if (user.otp !== otp) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid OTP'
                });
            }

            // Update user verification status
            await user.update({
                isEmailVerified: true,
                otp: null,
                otpExpiresAt: null
            });

            return res.status(200).json({
                success: true,
                message: 'Email verified successfully'
            });
        } catch (error) {
            console.error('Error in OTP verification:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async resendOTP(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
            }

            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (user.isEmailVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already verified'
                });
            }

            // Generate new OTP
            const otp = crypto.randomInt(100000, 999999).toString();
            const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Update user with new OTP
            await user.update({
                otp,
                otpExpiresAt: otpExpiration
            });

            // Send new OTP email
            await sendOTPEmail(email, otp);

            return res.status(200).json({
                success: true,
                message: 'New OTP sent successfully'
            });
        } catch (error) {
            console.error('Error in resending OTP:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

// Export a single instance
module.exports = new AuthController();
