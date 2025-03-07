const userModel = require("../models/user.model")
const logger = require('../config/logger');

class userService {
    async getAll() {
        try {
            const users = await userModel.getAll();
            logger.info(`Get all users`);
            return { users: users};
        } catch (error) {
            logger.error('Error while getting users:', error);
            throw error;
        }
    }
}

module.exports = new userService();
