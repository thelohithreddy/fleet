const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Remove quotes from MONGO_URI if present
        const uri = process.env.MONGO_URI.replace(/"/g, '');
        
        // Configure mongoose
        mongoose.set('strictQuery', false);
        
        // Connection options (removed deprecated options)
        const options = {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000
        };

        // Attempt connection
        const conn = await mongoose.connect(uri, options);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        
        // Check if MongoDB is not running
        if (error.name === 'MongoNetworkError') {
            console.error('\nPlease ensure that:');
            console.error('1. MongoDB is running');
            console.error('2. The connection URL is correct');
            console.error('3. MongoDB is listening on port 27017\n');
        }
        
        return false;
    }
};

// Check if MongoDB is connected
const isConnected = () => {
    return mongoose.connection.readyState === 1;
};

module.exports = { connectDB, isConnected };