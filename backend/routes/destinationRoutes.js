const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getRecommendations, 
  getAllDestinations, 
  getDestinationById, 
  createDestination,
  updateDestination,
  deleteDestination,
  searchDestinations,
  getPendingDestinations,
  addReview
} = require('../controllers/destinationController');

router.get('/recommend', getRecommendations);
router.get('/search', searchDestinations);
router.get('/pending', protect, getPendingDestinations);
router.get('/', getAllDestinations);
router.get('/:id', getDestinationById);
router.post('/', protect, createDestination);
router.put('/:id', protect, updateDestination);
router.delete('/:id', protect, deleteDestination);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
