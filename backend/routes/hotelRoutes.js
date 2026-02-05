const express = require('express');
const router = express.Router();
const { getHotelsByLocation, createHotel, getHotelById, getMyHotels, getPendingHotels, updateHotel, deleteHotel } = require('../controllers/hotelController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getHotelsByLocation);
router.get('/me', protect, getMyHotels);
router.get('/pending', protect, getPendingHotels);
router.post('/', protect, createHotel);
router.get('/:id', getHotelById);
router.put('/:id', protect, updateHotel);
router.delete('/:id', protect, deleteHotel);

module.exports = router;
