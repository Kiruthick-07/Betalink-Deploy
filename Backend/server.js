const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load dotenv only in development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Import routes
const authRoutes = require('./routes/auth');
const appRoutes = require('./routes/appRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatRoutes = require('./routes/chatRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Initialize express app
const app = express();

// Middleware
// CORS: allow frontend URLs in development, allow all in production or set to your Render frontend domain
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL] // Set this env var in Render to your deployed frontend URL
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175'
    ];
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (disabled to reduce terminal spam)
// app.use((req, res, next) => {
//     console.log(`${req.method} ${req.url}`);
//     next();
// });

// Routes
// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/apps', appRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'BetaLink API is running',
        timestamp: new Date().toISOString(),
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// MongoDB connection
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully');

        app.listen(PORT, () => {
            if (process.env.NODE_ENV === 'production') {
                // Render provides the public URL as process.env.RENDER_EXTERNAL_URL
                const serviceUrl = process.env.RENDER_EXTERNAL_URL || `https://your-service.onrender.com`;
                console.log(`🚀 Server is running on port ${PORT}`);
                console.log(`🌐 Service URL: ${serviceUrl}`);
                console.log(`🏥 Health check: ${serviceUrl}/api/health`);
            } else {
                console.log(`🚀 Server is running on port ${PORT}`);
                console.log(`📍 API URL: http://localhost:${PORT}`);
                console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
            }
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});
