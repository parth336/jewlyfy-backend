// src/api/v1/controllers/auth.controller.js
const storeService = require('../../services/store.service');
const logger = require('../../config/logger');

class userController {
    async getAllUsers(req, res) {
        try {
            const stores = await storeService.getAll()
            res.status(201).json({
                status: 'success',
                data: stores
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
