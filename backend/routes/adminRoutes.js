const express = require('express');
const router = express.Router();
const { verifyItem } = require('../controllers/adminController');

router.patch('/verify/:type/:id', verifyItem);

module.exports = router;
