const express = require('express');
const router = express.Router();
const { getAllExperiences } = require('../controllers/experienceController');

router.get('/', getAllExperiences);

module.exports = router;
