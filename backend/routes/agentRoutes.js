const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { registerAgent, getAgents, getMyAgentProfile } = require('../controllers/agentController');

router.post('/register', protect, registerAgent);
router.get('/', getAgents);
router.get('/me', protect, getMyAgentProfile);

module.exports = router;
