const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'App title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'App description is required']
    },
    logoPath: {
        type: String,
        default: ''
    },
    apkPath: {
        type: String,
        required: [true, 'APK file is required']
    },
    developer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    downloads: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('App', appSchema);
