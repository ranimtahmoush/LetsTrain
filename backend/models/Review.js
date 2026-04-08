const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  metrics: {
    knowledge: { type: Number, min: 0, max: 5 },
    communication: { type: Number, min: 0, max: 5 },
    motivation: { type: Number, min: 0, max: 5 },
    results: { type: Number, min: 0, max: 5 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);