const express = require('express');
const router = express.Router();
// import { confirmBooking } from "../controllers/bookingController.js";

const { 
    confirmBooking,
    getActiveBookings,
    getPastBookings,
    cancelBooking
} = require('../controllers/bookingController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/confirm-booking', confirmBooking);

// Get bookings
router.get('/active/:userId', getActiveBookings);
router.get('/past/:userId', getPastBookings);

// Cancel booking
router.put('/cancel/:bookingId', cancelBooking);

module.exports = router;

// should add authenticateUser middleware