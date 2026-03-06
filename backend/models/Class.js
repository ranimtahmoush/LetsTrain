const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Yoga', 'Pilates', 'HIIT', 'Strength Training', 'Cardio', 'Dance', 'Meditation', 'Other']
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  location: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'All Levels'
  },
  equipment: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Class', ClassSchema);