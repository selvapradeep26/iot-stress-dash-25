const SensorData = require('../models/sensorData');

// ✅ Add new sensor reading (with safe defaults)
exports.addReading = async (req, res) => {
  try {
    const { gsr = 0, heartRate = 0 } = req.body; // default to 0 if not provided

    const reading = new SensorData({
      userId: req.user.id,
      gsr,
      heartRate,
    });

    await reading.save();
    res.status(201).json(reading);
  } catch (err) {
    console.error("Error adding sensor reading:", err.message);
    res.status(500).json({ message: 'Server error while adding sensor reading' });
  }
};

// ✅ Get readings for a user (fallback if no data)
exports.getReadings = async (req, res) => {
  try {
    const readings = await SensorData.find({ userId: req.params.id }).sort({ timestamp: -1 });

    // If no readings found, return safe fallback
    if (!readings || readings.length === 0) {
      return res.status(200).json([
        {
          userId: req.params.id,
          gsr: 0,
          heartRate: 0,
          timestamp: new Date(),
        },
      ]);
    }

    res.json(readings);
  } catch (err) {
    console.error("Error fetching sensor readings:", err.message);
    res.status(500).json({ message: 'Server error while fetching sensor readings' });
  }
};
