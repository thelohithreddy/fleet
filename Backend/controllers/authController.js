const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP, sendOTP } = require('../utils/OTP');
const { OTP_RESEND_COOLDOWN_SEC } = require('../config/app');

const normalizeEmail = (email) => String(email).trim().toLowerCase();

const OtpRateLimitError = class extends Error {
    constructor(waitSec) {
        super(`Please wait ${waitSec} seconds before requesting another OTP.`);
        this.name = 'OtpRateLimitError';
        this.statusCode = 429;
        this.waitSec = waitSec;
    }
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const clearOtpsForEmail = (normalizedEmail) =>
    OTP.deleteMany({
        email: { $regex: new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i') },
    });

const saveOtpForEmail = async (email, otp) => {
    const normalizedEmail = normalizeEmail(email);
    const otpCode = String(otp).trim();
    await clearOtpsForEmail(normalizedEmail);
    return OTP.create({
        email: normalizedEmail,
        otp: otpCode,
        createdAt: new Date(),
    });
};

const assertOtpCooldown = async (normalizedEmail) => {
    const latest = await OTP.findOne({
        email: { $regex: new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i') },
    }).sort({ createdAt: -1 });

    if (!latest?.createdAt) return;

    const elapsedSec = (Date.now() - new Date(latest.createdAt).getTime()) / 1000;
    if (elapsedSec < OTP_RESEND_COOLDOWN_SEC) {
        throw new OtpRateLimitError(
            Math.ceil(OTP_RESEND_COOLDOWN_SEC - elapsedSec)
        );
    }
};

const issueOtp = async (normalizedEmail) => {
    await assertOtpCooldown(normalizedEmail);
    const otp = generateOTP();
    await saveOtpForEmail(normalizedEmail, otp);
    await sendOTP(normalizedEmail, otp);
    return otp;
};

const handleOtpRouteError = (res, error, fallbackMessage) => {
    if (error.name === 'OtpRateLimitError') {
        return res.status(429).json({
            success: false,
            message: error.message,
            retryAfterSec: error.waitSec,
        });
    }
    console.error(fallbackMessage, error);
    return res.status(500).json({
        success: false,
        message: error.message || fallbackMessage,
    });
};

const validateOtpForEmail = async (email, otp) => {
    const normalizedEmail = normalizeEmail(email);
    const otpString = String(otp).trim();

    if (!/^\d{6}$/.test(otpString)) {
        return {
            ok: false,
            status: 400,
            message: 'Invalid OTP format. Must be 6 digits.',
        };
    }

    const otpRecord = await OTP.findOne({
        email: { $regex: new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i') },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
        return {
            ok: false,
            status: 400,
            message: 'No OTP found for this email. Please request a new one.',
        };
    }

    if (String(otpRecord.otp).trim() !== otpString) {
        return {
            ok: false,
            status: 400,
            message: 'Invalid OTP. Use the latest code from your email (or tap Resend OTP).',
        };
    }

    const otpAge = (new Date() - otpRecord.createdAt) / 1000 / 60;
    if (otpAge > 10) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return {
            ok: false,
            status: 400,
            message: 'OTP has expired. Please request a new one.',
        };
    }

    return { ok: true, otpRecord, normalizedEmail };
};

const issueUserToken = (user) =>
    jwt.sign(
        { userId: user._id, isAdmin: false, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

const signup = async (req, res, next) => {
    try {
        const { email, password, confirmPassword } = req.body;
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser?.isVerified) {
            return res.status(400).json({
                success: false,
                message: "This email is already registered. Please sign in or use Forgot Password."
            });
        }

        // Remove stale unverified account so verify-otp can create a clean user
        if (existingUser && !existingUser.isVerified) {
            await User.deleteOne({ _id: existingUser._id });
        }

        await issueOtp(normalizedEmail);
        console.log(`OTP sent to ${normalizedEmail}`);

        res.status(200).json({
            success: true,
            message: "OTP sent successfully. Please check your email."
        });
    } catch (error) {
        if (error.name === 'OtpRateLimitError') {
            return handleOtpRouteError(res, error, 'Signup OTP error');
        }
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
        const normalizedEmail = normalizeEmail(email);

        const user = await User.findOne({ email: normalizedEmail });
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
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !otp || !password) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP, and password are required"
            });
        }

        const otpCheck = await validateOtpForEmail(normalizedEmail, otp);
        if (!otpCheck.ok) {
            return res.status(otpCheck.status).json({
                success: false,
                message: otpCheck.message,
            });
        }

        const existingUser = await User.findOne({ email: otpCheck.normalizedEmail });
        if (existingUser?.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered and verified. Please login instead."
            });
        }

        if (existingUser && !existingUser.isVerified) {
            await User.deleteOne({ _id: existingUser._id });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email: otpCheck.normalizedEmail,
            password: hashedPassword,
            role: 'customer',
            isVerified: true
        });
        await user.save();

        await OTP.deleteOne({ _id: otpCheck.otpRecord._id });

        const token = issueUserToken(user);

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
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "This email is already registered. Please login instead."
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Failed to verify OTP. Please try again."
        });
    }
};

const resendOTP = async (req, res, next) => {
    try {
        const normalizedEmail = normalizeEmail(req.body.email);
        if (!normalizedEmail) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        await issueOtp(normalizedEmail);
        res.status(200).json({ success: true, message: "New OTP sent successfully" });
    } catch (error) {
        if (error.name === 'OtpRateLimitError') {
            return handleOtpRouteError(res, error, 'Resend OTP error');
        }
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to resend OTP. Please try again."
        });
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const normalizedEmail = normalizeEmail(req.body.email);

        if (!normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email. Please sign up first.",
            });
        }

        await issueOtp(normalizedEmail);

        res.status(200).json({
            success: true,
            message: "Password reset OTP sent to your email.",
        });
    } catch (error) {
        if (error.name === 'OtpRateLimitError') {
            return handleOtpRouteError(res, error, 'Forgot password OTP error');
        }
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to send OTP. Check email settings and try again.",
        });
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail || !otp || !newPassword) {
            return res.status(400).json({ 
                success: false,
                message: "Email, OTP, and new password are required" 
            });
        }

        const otpCheck = await validateOtpForEmail(normalizedEmail, otp);
        if (!otpCheck.ok) {
            return res.status(otpCheck.status).json({
                success: false,
                message: otpCheck.message,
            });
        }

        const user = await User.findOne({ email: otpCheck.normalizedEmail });
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        const sameAsCurrent = await bcrypt.compare(newPassword, user.password);
        if (sameAsCurrent) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be the same as your current password. Please choose a different password.",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        await OTP.deleteOne({ _id: otpCheck.otpRecord._id });

        res.status(200).json({
            success: true,
            message: "Password reset successful. You can sign in now.",
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || "Failed to reset password" 
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