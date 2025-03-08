const BaseService = require('./base.service');
const UserModel = require('../models/user.model');
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');

class UserService extends BaseService {
    constructor() {
        super(UserModel, 'User');
    }

    async create(userData) {
        try {
            // Hash password before creating user
            if (userData.password) {
                userData.password = await bcrypt.hash(userData.password, 10);
            }
            return await super.create(userData);
        } catch (error) {
            logger.error('Error in UserService.create:', error);
            throw this.handleError(error, 'Failed to create user');
        }
    }

    async findByEmail(email) {
        try {
            const user = await this.model.findByEmail(email);
            return {
                success: true,
                data: user
            };
        } catch (error) {
            logger.error('Error in UserService.findByEmail:', error);
            throw this.handleError(error, 'Failed to fetch user by email');
        }
    }

    async updatePassword(userId, oldPassword, newPassword) {
        try {
            const user = await this.findById(userId);
            if (!user.success) {
                throw new Error('NOT_FOUND');
            }

            const isValidPassword = await bcrypt.compare(oldPassword, user.data.password);
            if (!isValidPassword) {
                throw new Error('INVALID_PASSWORD');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const result = await this.update(userId, { password: hashedPassword });
            
            return {
                success: true,
                message: 'Password updated successfully'
            };
        } catch (error) {
            logger.error('Error in UserService.updatePassword:', error);
            if (error.message === 'INVALID_PASSWORD') {
                throw {
                    success: false,
                    statusCode: 400,
                    message: 'Invalid old password'
                };
            }
            throw this.handleError(error, 'Failed to update password');
        }
    }

    async deactivateAccount(userId) {
        try {
            const result = await this.update(userId, { 
                isActive: false,
                deactivatedAt: new Date()
            });
            return {
                success: true,
                message: 'Account deactivated successfully'
            };
        } catch (error) {
            logger.error('Error in UserService.deactivateAccount:', error);
            throw this.handleError(error, 'Failed to deactivate account');
        }
    }
}

module.exports = new UserService();
