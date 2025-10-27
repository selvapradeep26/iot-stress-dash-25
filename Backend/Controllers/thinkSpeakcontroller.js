// controllers/thinkSpeakController.js
const axios = require("axios");

const channelID = "3125698";
const readAPIKey = "2LUMIGD4ZKOYIHW1";

const getThingSpeakData = async (req, res) => {
  try {
    const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${readAPIKey}&results=10`;
    const response = await axios.get(url);

    if (!response.data.feeds || response.data.feeds.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    const formatted = response.data.feeds.map(feed => {
      const value = Number(feed.field1);
      let stressLevel = "🟡 Moderate Stress";

      // Adjust these thresholds based on your GSR baseline
      if (value > 2100) stressLevel = "🟢 Relaxed";
      else if (value < 1850) stressLevel = "🔴 High Stress";

      return {
        created_at: feed.created_at,
        field1: value,
        stressLevel
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("ThingSpeak Fetch Error:", error.message);
    res.status(500).json({ message: "Failed to fetch ThingSpeak data" });
  }
};

module.exports = { getThingSpeakData };
