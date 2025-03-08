const logger = require('../config/logger');

class BaseService {
    constructor(model, modelName) {
        this.model = model;
        this.modelName = modelName;
    }

    async create(data) {
        try {
            const result = await this.model.create(data);
            return {
                success: true,
                data: result
            };
        } catch (error) {
            logger.error(`Error in ${this.modelName}.create:`, error);
            throw this.handleError(error, `Failed to create ${this.modelName}`);
        }
    }

    async findAll(options = {}) {
        try {
            const result = await this.model.getAll(options);
            return {
                success: true,
                data: result
            };
        } catch (error) {
            logger.error(`Error in ${this.modelName}.findAll:`, error);
            throw this.handleError(error, `Failed to fetch ${this.modelName}s`);
        }
    }

    async findById(id) {
        try {
            const result = await this.model.findById(id);
            if (!result) {
                throw new Error('NOT_FOUND');
            }
            return {
                success: true,
                data: result
            };
        } catch (error) {
            logger.error(`Error in ${this.modelName}.findById:`, error);
            throw this.handleError(error, `Failed to fetch ${this.modelName}`);
        }
    }

    async update(id, data) {
        try {
            const result = await this.model.update(id, data);
            if (!result) {
                throw new Error('NOT_FOUND');
            }
            return {
                success: true,
                data: result
            };
        } catch (error) {
            logger.error(`Error in ${this.modelName}.update:`, error);
            throw this.handleError(error, `Failed to update ${this.modelName}`);
        }
    }

    async delete(id) {
        try {
            const result = await this.model.delete(id);
            if (!result) {
                throw new Error('NOT_FOUND');
            }
            return {
                success: true,
                message: `${this.modelName} deleted successfully`
            };
        } catch (error) {
            logger.error(`Error in ${this.modelName}.delete:`, error);
            throw this.handleError(error, `Failed to delete ${this.modelName}`);
        }
    }

    handleError(error, defaultMessage) {
        if (error.message === 'NOT_FOUND') {
            return {
                success: false,
                statusCode: 404,
                message: `${this.modelName} not found`
            };
        }
        
        if (error.code === 'ER_DUP_ENTRY') {
            return {
                success: false,
                statusCode: 409,
                message: `${this.modelName} already exists`
            };
        }

        return {
            success: false,
            statusCode: 500,
            message: defaultMessage,
            error: error.message
        };
    }
}

module.exports = BaseService; 