const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gsr: { type: Number, required: true },
  heartRate: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SensorData', sensorSchema);
