const express = require('express');
const router = express.Router();
const { addReading, getReadings } = require('../Controllers/sensorController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, addReading);
router.get('/user/:id', authMiddleware, getReadings);

module.exports = router;