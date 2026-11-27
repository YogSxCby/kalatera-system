const db = require('../config/database');

// Get all products (dengan support search)
exports.getAllProducts = async (req, res) => {
    try {
        const search = req.query.search || '';
        
        let query = `
            SELECT p.*, 
            (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1) as primary_image,
            (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count
            FROM products p 
            WHERE p.status = 'active'
        `;
        
        let params = [];
        
        // Jika ada search query
        if (search) {
            query += ` AND (
                p.name LIKE ? OR 
                p.category LIKE ? OR 
                p.description LIKE ?
            )`;
            const searchParam = `%${search}%`;
            params = [searchParam, searchParam, searchParam];
        }
        
        query += ` ORDER BY p.id ASC`;
        
        const [rows] = await db.query(query, params);
        
        res.json({ 
            success: true, 
            count: rows.length, 
            data: rows 
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const [product] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        
        if (product.length === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
        }
        
        const [images] = await db.query(
            'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
            [req.params.id]
        );
        
        res.json({ 
            success: true, 
            data: { ...product[0], images, imageCount: images.length } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};