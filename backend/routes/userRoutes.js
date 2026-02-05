const express = require('express');
const router = express.Router();
const { getVisitedLocations, markVisited, updateProfile, getGuides } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/guides', getGuides);
router.get('/visited', protect, getVisitedLocations);
router.post('/visited', protect, markVisited);
router.put('/profile', protect, updateProfile);

module.exports = router;
