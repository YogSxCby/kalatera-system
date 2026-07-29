const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products - Get all products
router.get('/', productController.getAllProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', productController.getProductById);

// GET /api/products/category/:category - Get products by category
router.get('/category/:category', productController.getProductsByCategory);

module.exports = router;