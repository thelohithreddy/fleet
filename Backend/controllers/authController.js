const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP, sendOTP } = require('../utils/OTP');
 
const signup = async (req, res, next) => {
    try {
        const { email, password, confirmPassword } = req.body;

        // Validate inputs
        if (!email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: "User already exists.." 
            });
        }

        // Create unverified user
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const user = new User({
                email,
                password: hashedPassword,
                role: 'customer',
                isVerified: false
            });
            await user.save();

            // Generate and save new OTP
            const otp = generateOTP();
            await OTP.create({ 
                email, 
                otp,
                createdAt: new Date() 
            });

            // Send OTP
            await sendOTP(email, otp);
            console.log(`OTP sent to ${email}`);

            res.status(200).json({ 
                success: true,
                message: "OTP sent successfully. Please check your email." 
            });
        } catch (saveError) {
            // If there's an error saving the user, clean up
            await OTP.deleteOne({ email });
            console.error('User save error:', saveError);
            throw new Error('Failed to create user account. Please try again.');
        }
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || "Failed to send OTP. Please try again." 
        });
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect Password' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: 'Please verify your email first' });
        }

        const token = jwt.sign(
            { 
                userId: user._id,
                isAdmin: false 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp, password } = req.body;

        // Validate input
        if (!email || !otp || !password) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP, and password are required"
            });
        }

        // Ensure OTP is a string and exactly 6 digits
        const otpString = otp.toString();
        if (!/^\d{6}$/.test(otpString)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP format. Must be 6 digits."
            });
        }

        // Find and validate OTP
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "No OTP found for this email. Please request a new one."
            });
        }

        // Strict OTP comparison
        if (otpRecord.otp !== otpString) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again."
            });
        }

        // Check OTP expiration (10 minutes)
        const otpAge = (new Date() - otpRecord.createdAt) / 1000 / 60;
        if (otpAge > 10) {
            await OTP.deleteOne({ email });
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
        }

        // Check if user already exists and is verified
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.isVerified) {
                return res.status(400).json({
                    success: false,
                    message: "Email is already registered and verified. Please login instead."
                });
            } else {
                // User exists but not verified - update their password and verify them
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUser.password = hashedPassword;
                existingUser.isVerified = true;
                await existingUser.save();

                const token = jwt.sign(
                    { userId: existingUser._id, role: existingUser.role },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );

                await OTP.deleteOne({ email });

                return res.status(200).json({
                    success: true,
                    message: "User verified successfully!",
                    token,
                    user: {
                        id: existingUser._id,
                        email: existingUser.email,
                        role: existingUser.role
                    }
                });
            }
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ 
            email, 
            password: hashedPassword,
            role: 'customer',
            isVerified: true
        });
        await user.save();

        await OTP.deleteOne({ email });

        const token = jwt.sign(
            { 
                userId: user._id, 
                isAdmin: false,
            }, 

            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            success: true,
            message: "User registered successfully!",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        // Check for duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "This email is already registered. Please login instead."
            });
        }
        next(error);
    }
};

const resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        const otp = generateOTP();
        
        await OTP.findOneAndUpdate(
            { email },
            { otp, createdAt: new Date() },
            { upsert: true }
        );

        await sendOTP(email, otp);
        res.status(200).json({ message: "New OTP sent successfully" });
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const otp = generateOTP();
        await OTP.create({ email, otp, createdAt: new Date() });
        await sendOTP(email, otp);

        res.status(200).json({ message: "Password reset OTP sent to email" });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        
        // Validate input
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ 
                success: false,
                error: "Email, OTP, and new password are required" 
            });
        }

        // Ensure OTP is a string and exactly 6 digits
        const otpString = otp.toString();
        if (!/^\d{6}$/.test(otpString)) {
            return res.status(400).json({
                success: false,
                error: "Invalid OTP format. Must be 6 digits."
            });
        }

        // Find and validate OTP
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) {
            return res.status(400).json({ 
                success: false,
                error: "No OTP found for this email. Please request a new one." 
            });
        }

        // Strict OTP comparison
        if (otpRecord.otp !== otpString) {
            return res.status(400).json({
                success: false,
                error: "Invalid OTP. Please try again."
            });
        }

        // Check OTP expiration (10 minutes)
        const otpAge = (new Date() - otpRecord.createdAt) / 1000 / 60;
        if (otpAge > 10) {
            await OTP.deleteOne({ email });
            return res.status(400).json({
                success: false,
                error: "OTP has expired. Please request a new one."
            });
        }

        // Find user and update password
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: "User not found" 
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        // Delete used OTP
        await OTP.deleteOne({ email });

        res.status(200).json({ 
            success: true,
            message: "Password reset successful" 
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || "Failed to reset password" 
        });
    }
};

module.exports = { 
    signup, 
    login, 
    verifyOTP, 
    resendOTP, 
    forgotPassword, 
    resetPassword
};