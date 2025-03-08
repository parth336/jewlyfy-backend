// server.js
require('dotenv').config({ path: '.env.development' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./src/api/v1/config/logger');
const pool = require('./src/api/v1/config/database');
const { executeMigrations } = require('./src/utils/database');
const { errorHandler, AppError } = require('./src/api/v1/middleware/error.middleware');

const app = express();

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.logRequest(req, res, duration);
    });
    next();
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./src/api/v1/routes/auth.route');
const productRoutes = require('./src/api/v1/routes/product.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);

// Test database connection and run migrations
async function initializeDatabase() {
    try {
        const start = Date.now();
        await pool.query('SELECT 1');
        logger.logDB('Database connection test', Date.now() - start);
        logger.info('Database connected successfully');

        await executeMigrations();
        logger.info('Migrations executed successfully');
    } catch (error) {
        logger.logError(error);
        process.exit(1);
    }
}

// Health check route
app.get('/health', async (req, res, next) => {
    try {
        const start = Date.now();
        await pool.query('SELECT 1');
        logger.logDB('Health check query', Date.now() - start);
        
        res.json({ 
            status: 'OK',
            timestamp: new Date(),
            environment: 'development',
            database: 'Connected'
        });
    } catch (error) {
        next(new AppError('Database connection failed', 500));
    }
});

// Handle 404 routes
app.use((req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Initialize database and start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    logger.logError(error);
    process.exit(1);
});
