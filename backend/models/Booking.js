const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  trainerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Trainer's user ID for easier queries
  goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // e.g., "10:30"
  duration: { type: Number, required: true, enum: [30, 45, 60] }, // minutes
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  price: { type: Number, required: true },
  notes: { type: String, default: '' }, // Client notes for the session
  commission: { type: Number, default: 0.1 }, // 10%
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);