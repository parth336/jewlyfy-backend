// src/utils/database.js
const fs = require('fs').promises;
const path = require('path');
const logger = require('../api/v1/config/logger');
const pool = require('../api/v1/config/database');

async function executeMigrations() {
    try {const fs = require('fs').promises;
        const path = require('path');
        const logger = require('../api/v1/config/logger');
        const pool = require('../api/v1/config/database');
        
        async function executeMigrations() {
            try {
                const migrationFiles = await fs.readdir(path.join(__dirname, '../database/migrations'));
                
                for (const file of migrationFiles) {
                    if (file.endsWith('.sql')) {
                        const migration = await fs.readFile(
                            path.join(__dirname, '../database/migrations', file),
                            'utf8'
                        );
                        
                        // Split the file content into individual statements
                        const statements = migration
                            .split(';')
                            .filter(statement => statement.trim());
                        
                        // Execute each statement separately
                        for (const statement of statements) {
                            if (statement.trim()) {
                                await pool.query(statement);
                                logger.info(`Executed statement from ${file}`);
                            }
                        }
                        
                        logger.info(`Migration ${file} executed successfully`);
                    }
                }
            } catch (error) {
                logger.error('Error executing migrations:', error);
                throw error;
            }
        }
        
        module.exports = { executeMigrations };
        
        const migrationFiles = await fs.readdir(path.join(__dirname, '../database/migrations'));
        
        for (const file of migrationFiles) {
            if (file.endsWith('.sql')) {
                const migration = await fs.readFile(
                    path.join(__dirname, '../database/migrations', file),
                    'utf8'
                );
                
                await pool.query(migration);
                logger.info(`Migration ${file} executed successfully`);
            }
        }
    } catch (error) {
        logger.error('Error executing migrations:', error);
        throw error;
    }
}

module.exports = { executeMigrations };
