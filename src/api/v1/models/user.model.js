// src/api/v1/models/user.model.js
const pool = require('../config/database');
const logger = require('../config/logger');

class UserModel {
    async create({ email, password, firstName, lastName, phone, address, city, state, country, zipCode, profile_pic, is_active }) {
        try {
            const [result] = await pool.query(
                `INSERT INTO users (email, password, firstName, lastName, phone, address, city, state, country, zipCode, profile_pic, is_active) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [email, password, firstName, lastName, phone, address, city, state, country, zipCode, profile_pic, is_active]
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
                `SELECT 
                    u.id,
                    u.email,
                    u.password,
                    u.otp,
                    u.otpExpresAt,  
                    u.isEmailVerified,
                    r.name as role_name,
                    r.id as role_id,
                    r.description as role_description
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.userId
                LEFT JOIN roles r ON ur.roleId = r.id
                WHERE u.email = ?`,
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
                `SELECT 
                u.id,
                u.email,
                r.name as role_name,
                r.id as role_id,
                r.description as role_description   
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.userId
                LEFT JOIN roles r ON ur.roleId = r.id
                WHERE u.id = ?`,
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

    async assignRole(userId, roleId) {
        try {
            await pool.query('INSERT INTO user_roles (userId, roleId) VALUES (?, ?)', [userId, roleId]);
        } catch (error) {
            logger.error('Error assigning role:', error);
            throw new Error('Failed to assign role');
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
