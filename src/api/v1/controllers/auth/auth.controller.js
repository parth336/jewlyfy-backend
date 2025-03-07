// src/api/v1/controllers/auth.controller.js
const authService = require('../../services/auth.service');
const logger = require('../../config/logger');

class AuthController {
    async register(req, res) {
        try {
            const { email, password } = req.body;
            const user = await authService.register(email, password);
            res.status(201).json({
                status: 'success',
                data: user
            });
        } catch (error) {
            logger.error(`Registration failed: ${error.message}`);
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json({
                status: 'success',
                data: result
            });
        } catch (error) {
            logger.error(`Login failed: ${error.message}`);
            res.status(401).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async logout(req, res) {
        try {
            await authService.logout(req.user.id);
            res.json({
                status: 'success',
                message: 'Logged out successfully'
            });
        } catch (error) {
            logger.error(`Logout failed: ${error.message}`);
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            const tokens = await authService.refreshAccessToken(refreshToken);
            res.json({
                status: 'success',
                data: tokens
            });
        } catch (error) {
            logger.error(`Token refresh failed: ${error.message}`);
            res.status(401).json({
                status: 'error',
                message: error.message
            });
        }
    }
}

// Export an instance of the controller
module.exports = new AuthController();
