// src/api/v1/services/jwt.service.js
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

class JwtService {
    generateAccessToken(payload) {
        return jwt.sign(payload, jwtConfig.accessToken.secret, {
            expiresIn: jwtConfig.accessToken.expiresIn,
            algorithm: jwtConfig.accessToken.algorithm
        });
    }

    generateRefreshToken(payload) {
        return jwt.sign(payload, jwtConfig.refreshToken.secret, {
            expiresIn: jwtConfig.refreshToken.expiresIn,
            algorithm: jwtConfig.refreshToken.algorithm
        });
    }

    verifyAccessToken(token) {
        return jwt.verify(token, jwtConfig.accessToken.secret);
    }

    verifyRefreshToken(token) {
        return jwt.verify(token, jwtConfig.refreshToken.secret);
    }
}

module.exports = new JwtService();
