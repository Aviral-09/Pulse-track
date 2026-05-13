const express = require('express');
const router = express.Router();
const { getTopEvents, getEventsCount, getFunnel } = require('../controllers/analytics.controller');

router.get('/top-events', getTopEvents);
router.get('/events-count', getEventsCount);
router.get('/funnel', getFunnel);

module.exports = router;
