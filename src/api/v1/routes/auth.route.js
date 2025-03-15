// src/api/v1/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/auth.controller');
const userController = require('../controllers/users/user.controller');
const { validateRequest } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');
const { 
    registerSchema, 
    loginSchema, 
    refreshTokenSchema, 
    validateTokenSchema,
    verifyOTPSchema,
    resendOTPSchema,
    createUserSchema
} = require('../validators/auth.validator');

// Public routes
// router.post('/register', authController.register.bind(authController));
router.post('/login',validateRequest(loginSchema), authController.login.bind(authController));
router.post('/validate-token', validateRequest(validateTokenSchema), authController.validateToken);
router.post('/refresh-token', validateRequest(refreshTokenSchema), authController.refreshToken.bind(authController));

//Create user manually
router.post('/create-user',validateRequest(createUserSchema), authController.createUser.bind(authController));

// OTP verification routes with validation
// router.post('/verify-otp', validateRequest(verifyOTPSchema), authController.verifyOTP.bind(authController));
// router.post('/resend-otp', validateRequest(resendOTPSchema), authController.resendOTP.bind(authController));

// Protected routes
router.post('/logout', authenticate, authController.logout.bind(authController));


// Admin only routes
router.get('/users', authenticate, checkRole('admin'), userController.getAllUsers);

module.exports = router;
