// src/api/v1/controllers/product.controller.js
const ProductService = require('../../services/product.service');
const logger = require('../../config/logger');

class ProductController {
    async createProduct(req, res) {
        try {
            const product = await ProductService.createProduct(req.body);
            return res.status(201).json({ success: true, product });
        } catch (error) {
            logger.error('Error creating product:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAllProducts(req, res) {
        try {
            const products = await ProductService.getAllProducts();
            return res.status(200).json({ success: true, products });
        } catch (error) {
            logger.error('Error fetching products:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getProductById(req, res) {
        try {
            const product = await ProductService.getProductById(req.params.id);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
            return res.status(200).json({ success: true, product });
        } catch (error) {
            logger.error('Error fetching product by ID:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateProduct(req, res) {
        try {
            const product = await ProductService.updateProduct(req.body);
            return res.status(201).json({ success: true, product });
        } catch (error) {
            logger.error('Error creating product:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteProduct(req, res) {
        try {
            const product = await ProductService.deleteProduct(req.body);
            return res.status(201).json({ success: true, product });
        } catch (error) {
            logger.error('Error creating product:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getProductsByStore(req, res) {
        try {
            const product = await ProductService.getProductsByStore(req.body);
            return res.status(201).json({ success: true, product });
        } catch (error) {
            logger.error('Error creating product:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    
}

module.exports = new ProductController();