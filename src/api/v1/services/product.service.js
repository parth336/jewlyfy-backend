// src/api/v1/services/product.service.js
const BaseService = require('./base.service');
const ProductModel = require('../models/product.model');
const logger = require('../config/logger');

class ProductService extends BaseService {
    constructor() {
        super(ProductModel, 'Product');
    }

    // Product-specific methods
    async getProductsByStore(storeId) {
        try {
            const products = await this.model.findByStoreId(storeId);
            return {
                success: true,
                data: products
            };
        } catch (error) {
            logger.error('Error in ProductService.getProductsByStore:', error);
            throw this.handleError(error, 'Failed to fetch products by store');
        }
    }

    async updateProductStock(productId, quantity) {
        try {
            const product = await this.findById(productId);
            if (!product.success) {
                throw new Error('NOT_FOUND');
            }

            const updatedStock = product.data.stock + quantity;
            if (updatedStock < 0) {
                throw new Error('INSUFFICIENT_STOCK');
            }

            const result = await this.update(productId, { stock: updatedStock });
            return {
                success: true,
                data: result.data
            };
        } catch (error) {
            logger.error('Error in ProductService.updateProductStock:', error);
            if (error.message === 'INSUFFICIENT_STOCK') {
                throw {
                    success: false,
                    statusCode: 400,
                    message: 'Insufficient stock available'
                };
            }
            throw this.handleError(error, 'Failed to update product stock');
        }
    }
}

module.exports = new ProductService();