const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  goal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  price: { type: Number, required: true },
  commission: { type: Number, default: 0.1 }, // 10%
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);