const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const pool = require('../config/database');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(
    new JwtStrategy(options, async (jwtPayload, done) => {
        try {
            const [rows] = await pool.query(
                'SELECT id, email FROM users WHERE id = ?',
                [jwtPayload.id]
            );
            
            if (rows.length > 0) {
                return done(null, rows[0]);
            }
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

const authenticate = passport.authenticate('jwt', { session: false });

module.exports = { authenticate };
