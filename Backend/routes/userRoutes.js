const express = require('express');
const router = express.Router();
const { 
    getUserProfile, 
    updateUserProfile, 
    getHelpInfo, 
    logout
} = require('../controllers/userController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Profile routes
router.get('/profile', authenticateUser, getUserProfile);
router.put('/profile', authenticateUser, updateUserProfile);
router.get('/help', authenticateUser, getHelpInfo);
router.post('/logout', authenticateUser, logout);

module.exports = router;  // Make sure this line exists
