// src/api/v1/models/role.model.js
const pool = require('../config/database');
const logger = require('../config/logger');

class RoleModel {
    async findByName(name) {
        try {
            const [rows] = await pool.query(
                `SELECT * FROM roles WHERE name = ?`,
                [name]
            );
            return rows[0];
        } catch (error) {
            logger.error('Error finding role by name:', error);
            throw new Error('Failed to find role');
        }
    }

    async getUserRoles(userId) {
        try {
            const [rows] = await pool.query(
                `SELECT r.* 
                 FROM roles r
                 JOIN user_roles ur ON r.id = ur.roleId
                 WHERE ur.userId = ?`,
                [userId]
            );
            return rows;
        } catch (error) {
            logger.error('Error getting user roles:', error);
            throw new Error('Failed to get user roles');
        }
    }

    async assignRole(userId, roleId) {
        try {
            await pool.query(
                `INSERT INTO user_roles (userId, roleId) 
                 VALUES (?, ?)`,
                [userId, roleId]
            );
        } catch (error) {
            logger.error('Error assigning role:', error);
            throw new Error('Failed to assign role');
        }
    }
}

module.exports = new RoleModel();
