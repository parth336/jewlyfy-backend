// src/api/v1/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/auth.controller');
const userController = require('../controllers/auth/user.controller');
const { validateRequest } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');
const { registerSchema, loginSchema, refreshTokenSchema} = require('../validators/auth.validator');

// Public routes
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh-token', validateRequest(refreshTokenSchema), authController.refreshToken);

// Protected routes
router.post('/logout', authenticate, authController.logout);


// Admin only routes
router.get('/users', authenticate, checkRole('admin'), userController.getAllUsers);

module.exports = router;
