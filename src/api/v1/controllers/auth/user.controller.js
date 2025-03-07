// src/api/v1/controllers/auth.controller.js
const userService = require('../../services/user.service');
const logger = require('../../config/logger');

class userController {
    async getAllUsers(req, res) {
        try {
            const users = await userService.getAll()
            res.status(201).json({
                status: 'success',
                data: users
            });
        } catch (error) {
            logger.error(`Operation Failed: ${error.message}`);
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }
}

// Export an instance of the controller
module.exports = new userController();
