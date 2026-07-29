const db = require('../config/database');

// Create new inquiry
exports.createInquiry = async (req, res) => {
    try {
        const { customer_name, customer_phone, customer_email, product_id, message, budget_range } = req.body;
        
        // Validate required fields
        if (!customer_name || !customer_phone) {
            return res.status(400).json({
                success: false,
                message: 'Nama dan nomor WhatsApp wajib diisi'
            });
        }
        
        const [result] = await db.query(
            `INSERT INTO inquiries (customer_name, customer_phone, customer_email, product_id, message, budget_range) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [customer_name, customer_phone, customer_email || null, product_id || null, message || null, budget_range || null]
        );
        
        res.status(201).json({
            success: true,
            message: 'Inquiry berhasil dikirim! Kami akan menghubungi Anda via WhatsApp.',
            data: {
                inquiry_id: result.insertId
            }
        });
    } catch (error) {
        console.error('Error creating inquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating inquiry',
            error: error.message
        });
    }
};

// Get all inquiries (Admin only)
exports.getAllInquiries = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.*, p.name as product_name, p.category as product_category
            FROM inquiries i 
            LEFT JOIN products p ON i.product_id = p.id 
            ORDER BY i.created_at DESC
        `);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching inquiries',
            error: error.message
        });
    }
};

// Get inquiry by ID
exports.getInquiryById = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.*, p.name as product_name
            FROM inquiries i 
            LEFT JOIN products p ON i.product_id = p.id 
            WHERE i.id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching inquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching inquiry',
            error: error.message
        });
    }
};

// Update inquiry status
exports.updateInquiryStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const { id } = req.params;
        
        // Update inquiry status
        await db.query(
            'UPDATE inquiries SET status = ? WHERE id = ?',
            [status, id]
        );
        
        // Insert to project_status if notes provided
        if (notes) {
            await db.query(
                'INSERT INTO project_status (inquiry_id, status, notes) VALUES (?, ?, ?)',
                [id, status, notes]
            );
        }
        
        res.json({
            success: true,
            message: 'Status inquiry berhasil diupdate'
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating status',
            error: error.message
        });
    }
};

// Delete inquiry
exports.deleteInquiry = async (req, res) => {
    try {
        await db.query('DELETE FROM inquiries WHERE id = ?', [req.params.id]);
        
        res.json({
            success: true,
            message: 'Inquiry berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting inquiry',
            error: error.message
        });
    }
};