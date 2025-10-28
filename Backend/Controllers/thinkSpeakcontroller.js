const axios = require("axios");
const SensorData = require("../models/sensorData");

const channelID = "3125698";
const readAPIKey = "2LUMIGD4ZKOYIHW1";

// ✅ Helper: Calculate stress level from GSR
const calculateStressLevel = (gsrValue) => {
  if (gsrValue === 0) return "🟡 No Data (Hardware Disconnected)";
  if (gsrValue > 2100) return "🟢 Relaxed";
  if (gsrValue < 1850) return "🔴 High Stress";
  return "🟡 Moderate Stress";
};

// ✅ Helper: Detect stale ThingSpeak data (>2 min old)
const isStaleData = (timestamp) => {
  const now = new Date();
  const last = new Date(timestamp);
  const diffMs = now - last;
  const diffMinutes = diffMs / (1000 * 60);
  return diffMinutes > 1; // treat as disconnected if >2 minutes old
};

// ✅ Get live data from ThingSpeak with zero fallback for stale data
const getThingSpeakData = async (req, res) => {
  try {
    const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=10`;
    const response = await axios.get(url);

    // If ThingSpeak gives no data
    if (!response.data.feeds || response.data.feeds.length === 0) {
      return res.status(200).json([
        {
          created_at: new Date(),
          field1: 0,
          stressLevel: "🟡 No Data (Hardware Disconnected)",
        },
      ]);
    }

    const feeds = response.data.feeds;
    const latestFeed = feeds[feeds.length - 1];

    // If last update is too old -> set values to zero
    if (!latestFeed || isStaleData(latestFeed.created_at)) {
      return res.status(200).json([
        {
          created_at: new Date(),
          field1: 0,
          stressLevel: "🟡 No Data (Hardware Disconnected)",
        },
      ]);
    }

    // Format the available data
    const formatted = feeds.map((feed) => {
      const value = Number(feed.field1) || 0;
      return {
        created_at: feed.created_at,
        field1: value,
        stressLevel: calculateStressLevel(value),
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("ThingSpeak Fetch Error:", error.message);

    // Fallback if ThingSpeak request fails
    res.status(200).json([
      {
        created_at: new Date(),
        field1: 0,
        stressLevel: "🟡 No Data (Hardware Disconnected)",
      },
    ]);
  }
};

// ✅ Get user's saved historical data (with zero fallback)
const getUserThingSpeakData = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const readings = await SensorData.find({ userId })
      .sort({ timestamp: -1 })
      .limit(50);

    if (!readings || readings.length === 0) {
      return res.status(200).json([
        {
          created_at: new Date(),
          field1: 0,
          heartRate: 0,
          stressLevel: "🟡 No History Available",
        },
      ]);
    }

    const formatted = readings.map((reading) => ({
      created_at: reading.timestamp,
      field1: reading.gsr,
      heartRate: reading.heartRate,
      stressLevel: calculateStressLevel(reading.gsr),
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
};

// ✅ Save current ThingSpeak reading to user history (safe defaults)
const saveCurrentReading = async (req, res) => {
  try {
    const { userId, gsr, heartRate } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const reading = new SensorData({
      userId,
      gsr: gsr || 0,
      heartRate: heartRate || 0,
      timestamp: new Date(),
    });

    await reading.save();

    res.status(201).json({
      success: true,
      message: "Reading saved successfully",
      data: reading,
    });
  } catch (error) {
    console.error("Error saving reading:", error.message);
    res.status(500).json({ message: "Failed to save reading" });
  }
};

module.exports = {
  getThingSpeakData,
  getUserThingSpeakData,
  saveCurrentReading,
};
