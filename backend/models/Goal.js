const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  weightLoss: { type: Number }, // kg
  duration: { type: Number }, // weeks
  sessionsPerWeek: { type: Number },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', goalSchema);