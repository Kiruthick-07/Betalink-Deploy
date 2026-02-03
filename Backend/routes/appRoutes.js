const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const App = require('../models/App');
const authMiddleware = require('../middleware/auth');

// Configure Multer for APK uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
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
        if (file.mimetype === 'application/vnd.android.package-archive' || path.extname(file.originalname).toLowerCase() === '.apk') {
            cb(null, true);
        } else {
            cb(new Error('Only APK files are allowed!'));
        }
    }
});

// @route   POST /api/apps
// @desc    Upload and create new app
// @access  Private (Developer)
router.post('/', authMiddleware, upload.single('apk'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an APK file' });
        }

        const { title, description } = req.body;

        const app = new App({
            title,
            description,
            apkPath: req.file.path,
            developer: req.userId
        });

        await app.save();

        res.status(201).json({
            success: true,
            message: 'App uploaded successfully',
            app
        });
    } catch (error) {
        console.error('Upload app error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/apps
// @desc    Get all apps (for developers seeing their own, or generally listing)
//          Modified to: return apps by developer if query param ?developer=true (for Dashboard)
//          or all apps (for Testers).
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Simple logic: if user wants their own apps (developer dashboard)
        // Usually, we might check role or query param. 
        // For simplicity, let's just support ?mode=developer to get own apps, else get all.
        let query = {};
        if (req.query.mode === 'developer') {
            query.developer = req.userId;
        }

        const apps = await App.find(query).populate('developer', 'fullName email');

        res.status(200).json({
            success: true,
            count: apps.length,
            apps
        });
    } catch (error) {
        console.error('Get apps error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/apps/download/:appId
// @desc    Download APK file
// @access  Private
router.get('/download/:appId', authMiddleware, async (req, res) => {
    try {
        const app = await App.findById(req.params.appId);
        
        if (!app) {
            return res.status(404).json({ success: false, message: 'App not found' });
        }

        const filePath = path.join(__dirname, '..', app.apkPath);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'APK file not found' });
        }

        // Increment download count
        await App.findByIdAndUpdate(req.params.appId, { $inc: { downloads: 1 } });

        res.download(filePath, `${app.title}.apk`, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).json({ success: false, message: 'Download failed' });
            }
        });
    } catch (error) {
        console.error('Download app error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/apps/:appId
// @desc    Delete an app
// @access  Private (Developer only)
router.delete('/:appId', authMiddleware, async (req, res) => {
    console.log('DELETE request received for app:', req.params.appId);
    console.log('User ID:', req.userId);
    try {
        const app = await App.findById(req.params.appId);
        
        if (!app) {
            console.log('App not found:', req.params.appId);
            return res.status(404).json({ success: false, message: 'App not found' });
        }

        console.log('App found:', app.title);
        console.log('App developer:', app.developer.toString());
        console.log('Request user:', req.userId);

        // Check if the user is the owner of the app
        if (app.developer.toString() !== req.userId) {
            console.log('User not authorized to delete');
            return res.status(403).json({ success: false, message: 'Not authorized to delete this app' });
        }

        // Delete the APK file from the filesystem
        const filePath = path.join(__dirname, '..', app.apkPath);
        console.log('Deleting file:', filePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('File deleted successfully');
        }

        // Delete the app from database
        await App.findByIdAndDelete(req.params.appId);
        console.log('App deleted from database');

        res.json({ success: true, message: 'App deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
