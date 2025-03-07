const jwtConfig = {
    accessToken: {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
        algorithm: 'HS256'
    },
    refreshToken: {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
        algorithm: 'HS256'
    }
};

module.exports = jwtConfig;