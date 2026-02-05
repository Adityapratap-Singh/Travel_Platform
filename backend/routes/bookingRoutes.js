const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createBooking, getUserBookings, getProviderBookings } = require('../controllers/bookingController');

router.post('/agents/:id/book', protect, createBooking);
router.post('/hotels/:id/book', protect, createBooking);
router.post('/guides/:id/book', protect, createBooking);
router.get('/me', protect, getUserBookings);
router.get('/provider/me', protect, getProviderBookings);
// Keep old route for backward compatibility if frontend uses it, or just update frontend
router.get('/agent/me', protect, getProviderBookings);

module.exports = router;
