const express = require('express');
const router = express.Router();
const { 
    submitFeedback,
    getFeedbackStatus 
} = require('../controllers/ratingController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/submit',  submitFeedback);
router.get('/status/:bookingId',  getFeedbackStatus);

module.exports = router;

// should add authenticateUser middleware