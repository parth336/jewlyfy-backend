const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/products/product.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const { productSchema } = require('../validators/product.validator');

// Create a new product (Admin only)
router.post('/', authenticate, checkRole('admin'), validateRequest(productSchema), ProductController.createProduct);

// Get all products (Protected route)
router.get('/', authenticate, checkRole('admin'), ProductController.getAllProducts);

// Get a single product by ID (Protected route)
router.get('/:id', authenticate, checkRole('admin'), ProductController.getProductById);

// Update a product by ID (Admin only)
router.put('/:id', authenticate, checkRole('admin'), validateRequest(productSchema), ProductController.updateProduct);

// Delete a product by ID (Admin only)
router.delete('/:id', authenticate, checkRole('admin'), ProductController.deleteProduct);

// Get products by store ID (Protected route)
router.get('/store/:storeId', authenticate, checkRole('admin'), ProductController.getProductsByStore);

module.exports = router;
