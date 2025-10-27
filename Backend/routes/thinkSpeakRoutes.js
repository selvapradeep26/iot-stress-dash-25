// routes/thinkSpeakRoutes.js
const express = require("express");
const router = express.Router();

// Import controller correctly
const { getThingSpeakData } = require("../Controllers/thinkSpeakcontroller");

// Route for ThingSpeak
router.get("/", getThingSpeakData);

module.exports = router;
