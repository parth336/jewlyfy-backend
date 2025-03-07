// src/api/v1/services/auth.service.js
const bcrypt = require('bcryptjs');
const UserModel = require('../models/user.model');
const jwtService = require('./jwt.service');
const logger = require('../config/logger');
const RoleModel = require('../models/role.model');

class AuthService {
    async register(email, password) {
        try {
            // Check if user exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                throw new Error('User already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await UserModel.create({
                email,
                password: hashedPassword
            });

            // Assign default role
            await UserModel.assignDefaultRole(user.id);

            logger.info(`User registered successfully: ${email}`);
            return { id: user.id, email: user.email };
        } catch (error) {
            logger.error('Registration error:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            // Find user
            const user = await UserModel.findByEmail(email);
            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                throw new Error('Invalid credentials');
            }

            // Get user roles
            const roles = await RoleModel.getUserRoles(user.id);

            // Generate tokens with role information
            const accessToken = jwtService.generateAccessToken({
                id: user.id,
                email: user.email,
                roles: roles.map(role => role.name)
            });

            const refreshToken = jwtService.generateRefreshToken({
                id: user.id
            });

            // Update last login
            await UserModel.updateLastLogin(user.id);

            logger.info(`User logged in successfully: ${email}`);
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    roles: roles.map(role => role.name)
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            };
        } catch (error) {
            logger.error('Login error:', error);
            throw error;
        }
    }

    async verifyToken(token) {
        try {
            const decoded = jwtService.verifyAccessToken(token);
            const user = await UserModel.findById(decoded.id);
            
            if (!user) {
                throw new Error('User not found');
            }

            return user;
        } catch (error) {
            logger.error('Token verification error:', error);
            throw new Error('Invalid token');
        }
    }

    async refreshAccessToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = jwtService.verifyRefreshToken(refreshToken);
            
            // Get user
            const user = await UserModel.findById(decoded.id);
            if (!user) {
                throw new Error('User not found');
            }

            // Generate new access token
            const accessToken = jwtService.generateAccessToken({
                id: user.id,
                email: user.email
            });

            return { accessToken };
        } catch (error) {
            logger.error('Token refresh error:', error);
            throw new Error('Invalid refresh token');
        }
    }
}

module.exports = new AuthService();
