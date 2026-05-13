const express = require('express');
const router = express.Router();
const { identify } = require('../controllers/identity.controller');

router.post('/identify', identify);

module.exports = router;
