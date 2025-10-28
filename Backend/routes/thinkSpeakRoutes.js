// routes/thinkSpeakRoutes.js
const express = require("express");
const router = express.Router();
const { 
  getThingSpeakData, 
  getUserThingSpeakData,
  saveCurrentReading 
} = require("../Controllers/thinkSpeakcontroller");
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Get live ThingSpeak data (no auth needed)
router.get("/", getThingSpeakData);

// ✅ Get user's saved historical data (with userId query param)
router.get("/user", getUserThingSpeakData);

// ✅ Save current reading to user's history (requires auth)
router.post("/save", authMiddleware, saveCurrentReading);

module.exports = router;