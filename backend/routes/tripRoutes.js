const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

// Public route for viewing shared trips
router.get('/share/:id', tripController.getPublicTrip);

router.use(protect); // All other trip routes require auth

router.post('/', tripController.createTrip);
router.get('/', tripController.getUserTrips);
router.delete('/:id', tripController.deleteTrip);
router.patch('/:id/visibility', tripController.toggleTripVisibility);

module.exports = router;
