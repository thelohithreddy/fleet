const express = require('express');
const router = express.Router();
const { 
    signup, 
    login, 
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { 
    validateSignup, 
    validateLogin, 
    handleValidationErrors 
} = require('../middleware/validationMiddleware');

// Auth routes
router.post('/send-otp', validateSignup, handleValidationErrors, signup);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;