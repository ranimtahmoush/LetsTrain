const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  portfolio: [{ type: String }], // URLs to images/videos
  bio: { type: String },
  specialties: [{ type: String }],
  experience: { type: Number }, // years
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  pricePerSession: { type: Number, required: true },
  certificates: [{ type: String }], // e.g., ['Certified Personal Trainer', 'Nutrition Specialist']
  profilePicture: { type: String } // URL to profile picture
});

module.exports = mongoose.model('Trainer', trainerSchema);