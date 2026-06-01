const express = require('express');
const router = express.Router();
const { login ,validateToken} = require('../controllers/adminauth');


// Add token validation route

router.post('/login', login);
router.post('/validate-token', validateToken);
module.exports = router;
