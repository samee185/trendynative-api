const express = require('express');
const { initiatePayment, verifyPayment } = require('../controllers/paymentController');
const router = express.Router();
const authMiddleware = require("../middlewares/auth")

// Route to initiate payment
router.post('/initiate',authMiddleware.protectRoute,    initiatePayment);

// Route to verify payment
router.get('/verify',authMiddleware.protectRoute,  verifyPayment);

module.exports = router;