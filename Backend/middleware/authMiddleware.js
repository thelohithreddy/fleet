const jwt = require('jsonwebtoken');
const Administrator = require('../models/Administrator'); // Import the Administrator model

const authenticateUser = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { _id: decoded.userId };
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Admin authentication required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        // Verify the admin exists in the database
        const admin = await Administrator.findOne({ email: decoded.email });
        if (!admin) {
            return res.status(401).json({
                success: false,
                error: 'Admin not found or unauthorized'
            });
        }

        req.user = { 
            email: decoded.email,
            isAdmin: true 
        };
        
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

module.exports = {
    authenticateUser,
    authenticateAdmin
};