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

module.exports = {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    validateTokenSchema
};
