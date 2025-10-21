const SensorData = require('../models/SensorData');

exports.addReading = async (req, res) => {
  const { gsr, heartRate } = req.body;
  try {
    const reading = new SensorData({
      userId: req.user.id,
      gsr,
      heartRate
    });
    await reading.save();
    res.status(201).json(reading);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReadings = async (req, res) => {
  try {
    const readings = await SensorData.find({ userId: req.params.id }).sort({ timestamp: -1 });
    res.json(readings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
