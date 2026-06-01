const jwt = require('jsonwebtoken');
const Admin = require('../models/Administrator'); // Import the Admin model
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        // Find admin in the database
        const admin = await Admin.findOne({ email });
        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Generate token
        const token = jwt.sign(
            { 
                isAdmin: true,
                email: admin.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            user: admin,
            token: token,
            message: "Admin login successful"
        });
    } catch (error) {
        next(error);
    }
};

const validateToken = (req, res) => {
    const { token } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.isAdmin) {
            return res.status(200).json({ valid: true });
        }
        return res.status(403).json({ valid: false });
    } catch (error) {
        return res.status(401).json({ valid: false });
    }
};

module.exports = {
    login,
    validateToken
};