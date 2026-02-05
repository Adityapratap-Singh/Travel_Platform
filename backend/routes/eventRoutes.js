const express = require('express');
const router = express.Router();
const { subscribe } = require('../services/events');

router.get('/stream', (req, res) => {
  const channelsParam = req.query.channels;
  const channels = Array.isArray(channelsParam)
    ? channelsParam
    : (typeof channelsParam === 'string' ? channelsParam.split(',') : []);
  subscribe(res, channels);
});

module.exports = router;
