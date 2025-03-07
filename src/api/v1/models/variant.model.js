// src/api/v1/models/variant.model.js
const pool = require('../config/database');
const logger = require('../config/logger');

class VariantModel {
    async create({ productId, size, metal, diamondWeight, diamondType, price }) {
        try {
            const [result] = await pool.query(
                `INSERT INTO product_variants (product_id, size, metal, diamond_weight, diamond_type, price) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [productId, size, metal, diamondWeight, diamondType, price]
            );
            return { id: result.insertId, productId };
        } catch (error) {
            logger.error('Error creating variant:', error);
            throw new Error('Failed to create variant');
        }
    }

    async getByProductId(productId) {
        try {
            const [rows] = await pool.query(
                `SELECT * FROM product_variants WHERE product_id = ?`,
                [productId]
            );
            return rows;
        } catch (error) {
            logger.error('Error fetching variants:', error);
            throw new Error('Failed to fetch variants');
        }
    }

    async findById(variantId) {
        try {
            const [rows] = await pool.query(
                `SELECT * FROM product_variants WHERE id = ?`,
                [variantId]
            );
            return rows[0];
        } catch (error) {
            logger.error('Error finding variant by ID:', error);
            throw new Error('Failed to find variant');
        }
    }

    async update(variantId, { size, metal, diamondWeight, diamondType, price }) {
        try {
            await pool.query(
                `UPDATE product_variants 
                 SET size = ?, metal = ?, diamond_weight = ?, diamond_type = ?, price = ?
                 WHERE id = ?`,
                [size, metal, diamondWeight, diamondType, price, variantId]
            );
        } catch (error) {
            logger.error('Error updating variant:', error);
            throw new Error('Failed to update variant');
        }
    }

    async delete(variantId) {
        try {
            await pool.query(`DELETE FROM product_variants WHERE id = ?`, [variantId]);
        } catch (error) {
            logger.error('Error deleting variant:', error);
            throw new Error('Failed to delete variant');
        }
    }
}

module.exports = new VariantModel();
