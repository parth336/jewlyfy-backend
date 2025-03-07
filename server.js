// server.js
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const express = require('express');
const cors = require('cors');
const logger = require('./src/api/v1/config/logger');
const pool = require('./src/api/v1/config/database');
const { executeMigrations } = require('./src/utils/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./src/api/v1/routes/auth.route');
const productRoutes = require('./src/api/v1/routes/product.routes');
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);

// Test database connection and run migrations
async function initializeDatabase() {
    try {
        // Test database connection
        await pool.query('SELECT 1');
        logger.info('Database connected successfully');

        // Run migrations
        await executeMigrations();
        logger.info('Migrations executed successfully');
    } catch (error) {
        logger.error('Database initialization failed:', error);
        process.exit(1);
    }
}

// Health check route
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ 
            status: 'OK',
            timestamp: new Date(),
            environment: process.env.NODE_ENV,
            database: 'Connected'
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'ERROR',
            message: 'Database connection failed'
        });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 3000;

// Initialize database and start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
    });
});
