const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password wajib diisi'
            });
        }
        
        // Find user
        const [rows] = await db.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Username tidak ditemukan'
            });
        }
        
        const user = rows[0];
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Password salah'
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saat login',
            error: error.message
        });
    }
};

// Verify token middleware
exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token tidak ditemukan'
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token tidak valid'
        });
    }
};