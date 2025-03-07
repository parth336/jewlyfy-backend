// src/api/v1/models/product.model.js
const pool = require('../config/database');
const logger = require('../config/logger');

class ProductModel {
    async create({ name, description, price, isCustomizable, storeId }) {
        try {
            const [result] = await pool.query(
                `INSERT INTO products (name, description, price, is_customizable, store_id) 
                 VALUES (?, ?, ?, ?, ?)`,
                [name, description, price, isCustomizable, storeId]
            );
            return { id: result.insertId, name, storeId };
        } catch (error) {
            logger.error('Error creating product:', error);
            throw new Error('Failed to create product');
        }
    }

    async getAll({ storeId, categoryId, collectionId }) {
        try {
            let query = `SELECT * FROM products WHERE 1=1`;
            const params = [];
            
            if (storeId) {
                query += ` AND store_id = ?`;
                params.push(storeId);
            }
            if (categoryId) {
                query += ` AND id IN (SELECT product_id FROM product_categories WHERE category_id = ?)`;
                params.push(categoryId);
            }
            if (collectionId) {
                query += ` AND id IN (SELECT product_id FROM product_collections WHERE collection_id = ?)`;
                params.push(collectionId);
            }
            
            const [rows] = await pool.query(query, params);
            return rows;
        } catch (error) {
            logger.error('Error fetching products:', error);
            throw new Error('Failed to fetch products');
        }
    }

    async findById(productId) {
        try {
            const [rows] = await pool.query(
                `SELECT * FROM products WHERE id = ?`,
                [productId]
            );
            return rows[0];
        } catch (error) {
            logger.error('Error finding product by ID:', error);
            throw new Error('Failed to find product');
        }
    }

    async update(productId, { name, description, price, isCustomizable }) {
        try {
            await pool.query(
                `UPDATE products 
                 SET name = ?, description = ?, price = ?, is_customizable = ?
                 WHERE id = ?`,
                [name, description, price, isCustomizable, productId]
            );
        } catch (error) {
            logger.error('Error updating product:', error);
            throw new Error('Failed to update product');
        }
    }

    async delete(productId) {
        try {
            await pool.query(`DELETE FROM products WHERE id = ?`, [productId]);
        } catch (error) {
            logger.error('Error deleting product:', error);
            throw new Error('Failed to delete product');
        }
    }
}

module.exports = new ProductModel();
