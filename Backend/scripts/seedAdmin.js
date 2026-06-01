const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Administrator = require('../models/Administrator'); // Import the Administrator model
dotenv.config(); // Load environment variables from .env file
const seedAdmin = async () => {
    try {
        // Connect to the database
        await mongoose.connect(process.env.MONGO_URI);

        // Check if the admin already exists
        const existingAdmin = await Administrator.findOne({ email: 'fleetiitk@gmail.com' });
        if (existingAdmin) {
            console.log('Admin already exists in the database.');
            process.exit();
        }

        // Create a new admin
        const admin = new Administrator({
            email: 'fleetiitk@gmail.com',
            password: 'admin123456' // This will be hashed automatically by the pre-save hook
        });

        // Save the admin to the database
        await admin.save();
        console.log('Admin account created successfully.');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin account:', error);
        process.exit(1);
    }
};

seedAdmin(); 