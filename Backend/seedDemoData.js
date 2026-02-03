// Quick Demo Data Seeder for BetaLink
// Run this script to create test data: node seedDemoData.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Define schemas inline for simplicity
const userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    role: String,
    createdAt: { type: Date, default: Date.now }
});

const appSchema = new mongoose.Schema({
    title: String,
    description: String,
    logoPath: String,
    apkPath: String,
    developer: mongoose.Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const App = mongoose.model('App', appSchema);

async function seedData() {
    try {
        console.log('🌱 Starting data seed...\n');

        // Clear existing data (optional - comment out if you want to keep existing data)
        // await User.deleteMany({});
        // await App.deleteMany({});
        // console.log('🗑️  Cleared existing data\n');

        // Create Developer User
        const hashedPassword = await bcrypt.hash('test123', 10);
        
        const developer = await User.create({
            fullName: 'John Developer',
            email: 'developer@test.com',
            password: hashedPassword,
            role: 'developer'
        });
        console.log('✅ Created Developer:', developer.email);

        // Create Tester User
        const tester = await User.create({
            fullName: 'Jane Tester',
            email: 'tester@test.com',
            password: hashedPassword,
            role: 'tester'
        });
        console.log('✅ Created Tester:', tester.email);

        // Create Sample Apps
        const apps = [
            {
                title: 'Photo Editor Pro',
                description: 'Professional photo editing app with AI-powered filters and effects. Test the new batch processing feature.',
                logoPath: '',
                apkPath: 'uploads/sample-app-1.apk',
                developer: developer._id
            },
            {
                title: 'Fitness Tracker',
                description: 'Track your workouts, calories, and health metrics. Please test the new GPS tracking feature.',
                logoPath: '',
                apkPath: 'uploads/sample-app-2.apk',
                developer: developer._id
            },
            {
                title: 'Recipe Manager',
                description: 'Organize your favorite recipes and meal plans. Looking for feedback on the new shopping list integration.',
                logoPath: '',
                apkPath: 'uploads/sample-app-3.apk',
                developer: developer._id
            }
        ];

        for (const appData of apps) {
            const app = await App.create(appData);
            console.log('✅ Created App:', app.title);
        }

        console.log('\n🎉 Demo data seeded successfully!\n');
        console.log('📝 Login Credentials:');
        console.log('   Developer:');
        console.log('     Email: developer@test.com');
        console.log('     Password: test123');
        console.log('');
        console.log('   Tester:');
        console.log('     Email: tester@test.com');
        console.log('     Password: test123');
        console.log('');
        console.log('⚠️  Note: APK files are not created. Download buttons will show 404 unless you upload real APK files.');
        console.log('   You can upload apps through the Developer Dashboard after logging in.\n');

    } catch (error) {
        console.error('❌ Seeding error:', error);
    } finally {
        mongoose.connection.close();
        console.log('👋 Database connection closed');
    }
}

seedData();
