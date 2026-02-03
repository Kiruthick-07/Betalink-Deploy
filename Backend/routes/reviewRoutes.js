const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Review = require('../models/Review');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// Configure Multer for review image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/reviews/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   GET /api/reviews/:appId
// @desc    Get reviews for a specific app
// @access  Private
router.get('/:appId', authMiddleware, async (req, res) => {
    try {
        const reviews = await Review.find({ app: req.params.appId })
            .populate('tester', 'fullName email') // Get tester details
            .sort({ createdAt: 1 }); // Oldest first as per requirement

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private (Tester)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { appId, rating, content } = req.body;

        const review = new Review({
            app: appId,
            tester: req.userId,
            rating,
            content,
            image: req.file ? req.file.path : null
        });

        await review.save();

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
