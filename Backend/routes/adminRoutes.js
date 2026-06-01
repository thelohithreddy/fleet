const express = require('express');
const router = express.Router();
const {
  getAllVehicles,
  addVehicle,
  updateVehicle,
  removeVehicle,
  getAllBookings,
  viewBookingsByDate,
  addDriver,
  removeDriver,
  getDrivers,
  getDriverProfile,
  updateDriverProfile,
  updateDriver
} = require('../controllers/adminController');

const { login ,validateToken} = require('../controllers/adminauth');
const {  authenticateAdmin } = require('../middleware/authMiddleware');

// Login route - no authentication needed
router.post('/login', login);
router.post('/validate-token', validateToken);

// All routes below this point require admin authentication
// router.use(authenticateAdmin);
// router.use(authenticateAdmin);
// Vehicle routes
router.get('/vehicles', getAllVehicles);
router.post('/vehicles', addVehicle);
router.put('/vehicles/:id', updateVehicle);
router.delete('/vehicles/:id', removeVehicle);

// Booking routes
router.get('/bookings', getAllBookings);
router.get('/bookings/date', viewBookingsByDate);

// Driver routes
router.post('/drivers', addDriver);
router.get('/drivers', getDrivers);
router.get('/drivers/profile', getDriverProfile);
router.put('/drivers/profile', updateDriverProfile);
router.put('/drivers/:id', updateDriver);
router.delete('/drivers/:id', removeDriver);

module.exports = router;
