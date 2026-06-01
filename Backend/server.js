require('dotenv').config();
require('events').EventEmitter.defaultMaxListeners = 15; // Increase max listeners
const express = require('express');
const { connectDB, isConnected } = require('./config/db');
const User = require('./models/User');
const app = require('./app');
const port = process.env.PORT || 5000;

// Function to retry MongoDB connection
const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        console.log(`Attempting to connect to MongoDB (attempt ${i + 1}/${retries})...`);
        
        const connected = await connectDB();
        if (connected) {
            return true;
        }

        if (i < retries - 1) {
            console.log(`Retrying in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return false;
};

// Function to check if port is in use
const isPortInUse = async (port) => {
    return new Promise((resolve) => {
        const server = require('net').createServer()
            .once('error', () => resolve(true))
            .once('listening', () => {
                server.close();
                resolve(false);
            })
            .listen(port);
    });
};

// Function to start server
const startServer = async () => {
    try {
        // Try to connect to MongoDB with retries
        const connected = await connectWithRetry();
        if (!connected) {
            console.error('Failed to connect to MongoDB after multiple attempts');
            process.exit(1);
        }

        // Check if port is in use
        const portInUse = await isPortInUse(port);
        if (portInUse) {
            console.error(`⚠️ Port ${port} is already in use. Please:
            1. Stop any other server using port ${port}
            2. Use 'taskkill /F /IM node.exe' to stop all Node processes
            3. Or set a different port in .env file`);
            process.exit(1);
        }

        // Recreate indexes to fix the username unique constraint
        await User.recreateIndexes();
        console.log('Indexes recreated successfully');

        // Start the server
        const server = app.listen(port, '0.0.0.0', () => {
            console.log(`
Server Status:
Port: ${port}
URL: http://localhost:${port}
MongoDB: Connected
JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'Missing'}
Email: ${process.env.gmail ? 'Configured' : 'Missing'}
            `);
        });

        // Handle server errors
        server.on('error', (err) => {
            console.error('Server error:', err);
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${port} is already in use`);
            }
            process.exit(1);
        });

        // Add health check endpoint
        app.get('/health', (req, res) => {
            res.json({
                status: 'up',
                port: port,
                mongodb: isConnected() ? 'Connected' : 'Disconnected',
                timestamp: new Date().toISOString()
            });
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer().catch(error => {
    console.error('Fatal error starting server:', error);
    process.exit(1);
});