const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  exerciseName: { type: String, required: true },
  duration: { type: Number }, // minutes
  sets: { type: Number },
  reps: { type: Number },
  weight: { type: Number }, // kg
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);