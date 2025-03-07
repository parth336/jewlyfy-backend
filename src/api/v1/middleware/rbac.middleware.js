// src/api/v1/middlewares/rbac.middleware.js
const UserModel = require('../models/user.model');
const logger = require('../config/logger');

const checkRole = (roleName) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const hasRole = await UserModel.hasRole(userId, roleName);

            if (!hasRole) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied: Insufficient privileges'
                });
            }

            next();
        } catch (error) {
            logger.error('Role check error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error checking user role'
            });
        }
    };
};

module.exports = { checkRole };
