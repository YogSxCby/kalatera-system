const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const authController = require('../controllers/authController');

// POST /api/inquiries - Create new inquiry (Public)
router.post('/', inquiryController.createInquiry);

// GET /api/inquiries - Get all inquiries (Admin only)
router.get('/', authController.verifyToken, inquiryController.getAllInquiries);

// GET /api/inquiries/:id - Get inquiry by ID (Admin only)
router.get('/:id', authController.verifyToken, inquiryController.getInquiryById);

// PUT /api/inquiries/:id/status - Update status (Admin only)
router.put('/:id/status', authController.verifyToken, inquiryController.updateInquiryStatus);

// DELETE /api/inquiries/:id - Delete inquiry (Admin only)
router.delete('/:id', authController.verifyToken, inquiryController.deleteInquiry);

module.exports = router;