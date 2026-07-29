const db = require('../config/database');

// Get all active products
exports.getAllProducts = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM products WHERE status = ? ORDER BY created_at DESC',
            ['active']
        );
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM products WHERE id = ?',
            [req.params.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM products WHERE category = ? AND status = ?',
            [req.params.category, 'active']
        );
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};