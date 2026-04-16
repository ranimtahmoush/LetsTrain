const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'trainer'], required: true },
  location: { type: String }, // City in Lebanon
  phone: { type: String },
  instagram: { type: String }, // Instagram handle
  tiktok: { type: String }, // TikTok handle
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);