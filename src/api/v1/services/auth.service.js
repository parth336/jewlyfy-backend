// src/api/v1/services/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const pool = require('../config/database');
const UserService = require('./user.service');
const JwtService = require('./jwt.service');
const { AppError } = require('../middleware/error.middleware');

class AuthService {
    constructor() {
        this.userService = UserService;
        this.jwtService = JwtService;
    }

    async register(userData) {
        try {
            // Check if user exists
            const [existingUser] = await pool.query(
                'SELECT id FROM users WHERE email = ?',
                [userData.email]
            );

            if (existingUser.length > 0) {
                logger.error('Registration failed: User exists', {
                    email: userData.email
                });
                throw new Error('User with this email already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Create user
            const [result] = await pool.query(
                'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
                [userData.email, hashedPassword, userData.name, 'user']
            );

            logger.info('User registered successfully', {
                userId: result.insertId
            });

            return {
                id: result.insertId,
                email: userData.email,
                name: userData.name
            };
        } catch (error) {
            logger.error('Registration error:', error);
            throw new Error('Registration failed');
        }
    }

    async login(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            const [users] = await pool.query(
                `SELECT 
                    u.id,
                    u.email,
                    u.password,
                    r.name as role_name,
                    r.id as role_id,
                    r.description as role_description
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.userId
                LEFT JOIN roles r ON ur.roleId = r.id
                WHERE u.email = ?`,
                [email]
            );

            const user = users[0];
            if (!user) {
                logger.warn('Login attempt with non-existent email', {
                    email: email
                });
                throw new Error('Invalid credentials');
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                logger.warn('Invalid password attempt', {
                    userId: user.id
                });
                throw new Error('Invalid credentials');
            }

            // Use JwtService to generate tokens
            const tokens = await this.jwtService.generateTokens(user);

            logger.info('User logged in successfully', {
                userId: user.id
            });

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role_name
                },
                ...tokens
            };
        } catch (error) {
            logger.error('Login error:', error);
            throw new Error('Login failed');
        }
    }

    async revokeUserTokens(userId) {
        try {
            await pool.query(
                'DELETE FROM refresh_tokens WHERE user_id = ?',
                [userId]
            );
            logger.info('User tokens revoked', { userId });
        } catch (error) {
            logger.error('Failed to revoke user tokens:', error);
            throw new AppError('Failed to revoke user tokens', 500);
        }
    }
}

module.exports = new AuthService();
