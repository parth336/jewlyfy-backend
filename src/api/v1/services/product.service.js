// src/api/v1/services/product.service.js
const ProductModel = require('../models/product.model');
const logger = require('../config/logger');

class ProductService {
    async createProduct(data) {
        try {
            return await ProductModel.create(data);
        } catch (error) {
            logger.error('Error in ProductService.createProduct:', error);
            throw new Error('Failed to create product');
        }
    }

    async getAllProducts() {
        try {
            return await ProductModel.getAll();
        } catch (error) {
            logger.error('Error in ProductService.getAllProducts:', error);
            throw new Error('Failed to fetch products');
        }
    }

    async getProductById(productId) {
        try {
            return await ProductModel.findById(productId);
        } catch (error) {
            logger.error('Error in ProductService.getProductById:', error);
            throw new Error('Failed to fetch product');
        }
    }
}

module.exports = new ProductService();