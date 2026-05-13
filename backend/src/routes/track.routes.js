const express = require('express');
const router = express.Router();
const { trackSingle, trackBatch } = require('../controllers/track.controller');

router.post('/', trackSingle);
router.post('/batch', trackBatch);

module.exports = router;
