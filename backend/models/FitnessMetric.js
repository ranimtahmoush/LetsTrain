const mongoose = require('mongoose');

const fitnessMetricSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  weight: { type: Number, required: true }, // kg
  bodyFat: { type: Number }, // percentage
  muscleWeight: { type: Number }, // kg
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FitnessMetric', fitnessMetricSchema);