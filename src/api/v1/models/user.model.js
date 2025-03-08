// src/api/v1/models/user.model.js
const pool = require('../config/database');
const logger = require('../config/logger');

class UserModel {
    async create({ email, password }) {
        try {
            const [result] = await pool.query(
                `INSERT INTO users (email, password) 
                 VALUES (?, ?)`,
                [email, password]
            );
            return { id: result.insertId, email };
        } catch (error) {
            logger.error('Error in creating user:', error);
            throw new Error('Failed to create user');
        }
    }

    async getAll() {
        try {
            const [rows] = await pool.query(
                `SELECT * FROM users`
            );
            return rows;
        } catch (error) {
            logger.error('Error in getting all users:', error);
            throw new Error('Failed to get users');
        }
    }

    async findByEmail(email) {
        try {
            const [rows] = await pool.query(
                `SELECT * FROM users 
                 WHERE email = ?`,
                [email]
            );
            return rows[0];
        } catch (error) {
            logger.error('Error in finding user by email:', error);
            throw new Error('Failed to find user');
        }
    }

    async findById(id) {
        try {
            const [rows] = await pool.query(
                `SELECT id, email 
                 FROM users 
                 WHERE id = ?`,
                [id]
            );
            return rows[0];
        } catch (error) {
            logger.error('Error in finding user by id:', error);
            throw new Error('Failed to find user');
        }
    }

    async update(id, data) {
        try {
            // Create SET clause dynamically from data object
            const setClause = Object.keys(data)
                .map(key => `${key} = ?`)
                .join(', ');
            const values = [...Object.values(data), id];

            const [result] = await pool.query(
                `UPDATE users 
                 SET ${setClause}
                 WHERE id = ?`,
                values
            );

            if (result.affectedRows === 0) {
                return null;
            }

            return { id, ...data };
        } catch (error) {
            logger.error('Error updating user:', error);
            throw new Error('Failed to update user');
        }
    }

    async updateLastLogin(userId) {
        try {
            return await this.update(userId, { lastLoginAt: new Date() });
        } catch (error) {
            logger.error('Error updating last login:', error);
            throw new Error('Failed to update last login');
        }
    }

    async updatePassword(userId, hashedPassword) {
        try {
            return await this.update(userId, { password: hashedPassword });
        } catch (error) {
            logger.error('Error updating password:', error);
            throw new Error('Failed to update password');
        }
    }

    async assignDefaultRole(userId) {
        try {
            const [defaultRole] = await pool.query(
                'SELECT id FROM roles WHERE name = ?',
                ['user']
            );
            
            if (defaultRole[0]) {
                await pool.query(
                    'INSERT INTO user_roles (userId, roleId) VALUES (?, ?)',
                    [userId, defaultRole[0].id]
                );
            }
        } catch (error) {
            logger.error('Error assigning default role:', error);
            throw new Error('Failed to assign default role');
        }
    }

    async hasRole(userId, roleName) {
        try {
            const [rows] = await pool.query(
                `SELECT COUNT(*) as count 
                 FROM user_roles ur 
                 JOIN roles r ON ur.roleId = r.id 
                 WHERE ur.userId = ? AND r.name = ?`,
                [userId, roleName]
            );
            return rows[0].count > 0;
        } catch (error) {
            logger.error('Error checking user role:', error);
            throw new Error('Failed to check user role');
        }
    }
}

module.exports = new UserModel();
