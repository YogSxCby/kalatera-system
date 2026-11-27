const mysql = require('mysql2/promise');

// Koneksi database TiDB Cloud
async function getDbConnection() {
    return mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT) || 4000,
        ssl: {
            rejectUnauthorized: false
        }
    });
}

// Handler utama untuk semua request /api/*
exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Ambil path setelah /api/
    const path = event.path.replace('/.netlify/functions/api', '').replace('/api', '');
    const method = event.httpMethod;

    console.log('Request:', method, path);

    try {
        // ============================================
        // ROUTE: GET /api/health
        // ============================================
        if (path === '/health' && method === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    status: 'OK',
                    message: 'Kalatera.Interior API is running!',
                    timestamp: new Date().toISOString()
                })
            };
        }

        // ============================================
        // ROUTE: GET /api/products
        // ============================================
        if (path === '/products' && method === 'GET') {
            const connection = await getDbConnection();
            
            const search = event.queryStringParameters?.search || '';
            
            let query = `
                SELECT p.*, 
                (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1) as primary_image,
                (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count
                FROM products p 
            `;
            
            let params = [];
            
            if (search) {
                query += ` WHERE (
                    p.name LIKE ? OR 
                    p.category LIKE ? OR 
                    p.description LIKE ?
                )`;
                const searchParam = `%${search}%`;
                params = [searchParam, searchParam, searchParam];
            }
            
            query += ` ORDER BY p.id ASC`;
            
            const [rows] = await connection.query(query, params);
            await connection.end();
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    count: rows.length,
                    data: rows
                })
            };
        }

        // ============================================
        // ROUTE: GET /api/products/:id
        // ============================================
        const productMatch = path.match(/^\/products\/(\d+)$/);
        if (productMatch && method === 'GET') {
            const productId = productMatch[1];
            const connection = await getDbConnection();
            
            const [product] = await connection.query(
                'SELECT * FROM products WHERE id = ?',
                [productId]
            );
            
            if (product.length === 0) {
                await connection.end();
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Produk tidak ditemukan'
                    })
                };
            }
            
            const [images] = await connection.query(
                'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
                [productId]
            );
            
            await connection.end();
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: {
                        ...product[0],
                        images: images,
                        imageCount: images.length
                    }
                })
            };
        }

        // ============================================
        // ROUTE: Tidak ditemukan
        // ============================================
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Endpoint tidak ditemukan: ' + path
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Server error: ' + error.message
            })
        };
    }
};