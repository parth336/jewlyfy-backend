const Joi = require('joi');

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required()
});

const validateTokenSchema = Joi.object({
    token: Joi.string().required(),
    type: Joi.string().valid('access', 'refresh').required()
});

const verifyOTPSchema = Joi.object({
    email: Joi.string().email().required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
        .messages({
            'string.length': 'OTP must be 6 digits',
            'string.pattern.base': 'OTP must contain only numbers',
            'any.required': 'OTP is required'
        })
});

const resendOTPSchema = Joi.object({
    email: Joi.string().email().required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
});

const createUserSchema = Joi.object({
    email: Joi.string().email().required(),
    role: Joi.string().valid('admin', 'user').required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(), 
    country: Joi.string().required(),
    zipCode: Joi.string().required(),
    profilePicture: Joi.string().optional(),
    is_active: Joi.boolean().required(),
});

module.exports = {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    validateTokenSchema,
    verifyOTPSchema,
    resendOTPSchema,
    createUserSchema
};
