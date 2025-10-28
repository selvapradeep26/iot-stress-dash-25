const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gsr: { type: Number, required: true },
  heartRate: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

// ✅ Add index for faster queries
sensorSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('SensorData', sensorSchema);