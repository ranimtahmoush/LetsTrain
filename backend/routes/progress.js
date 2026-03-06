const express = require('express');
const WorkoutLog = require('../models/WorkoutLog');
const ProgressPhoto = require('../models/ProgressPhoto');
const FitnessMetric = require('../models/FitnessMetric');
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

const router = express.Router();

// Workout Logs
router.get('/workout-logs', auth, async (req, res) => {
  try {
    const logs = await WorkoutLog.find({ client: req.user.id }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/workout-logs', auth, async (req, res) => {
  const { date, exerciseName, duration, sets, reps, weight, notes } = req.body;
  try {
    const log = new WorkoutLog({
      client: req.user.id,
      date,
      exerciseName,
      duration,
      sets,
      reps,
      weight,
      notes
    });
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/workout-logs/:id', auth, async (req, res) => {
  try {
    const log = await WorkoutLog.findById(req.params.id);
    if (!log || log.client.toString() !== req.user.id) return res.status(403).json({ msg: 'Access denied' });
    await WorkoutLog.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Progress Photos
router.get('/progress-photos', auth, async (req, res) => {
  try {
    const photos = await ProgressPhoto.find({ client: req.user.id }).sort({ date: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/progress-photos', auth, async (req, res) => {
  const { imageUrl, date, notes } = req.body;
  try {
    const photo = new ProgressPhoto({
      client: req.user.id,
      imageUrl,
      date,
      notes
    });
    await photo.save();
    res.json(photo);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/progress-photos/:id', auth, async (req, res) => {
  try {
    const photo = await ProgressPhoto.findById(req.params.id);
    if (!photo || photo.client.toString() !== req.user.id) return res.status(403).json({ msg: 'Access denied' });
    await ProgressPhoto.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Fitness Metrics
router.get('/fitness-metrics', auth, async (req, res) => {
  try {
    const metrics = await FitnessMetric.find({ client: req.user.id }).sort({ date: -1 });
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/fitness-metrics', auth, async (req, res) => {
  const { date, weight, bodyFat, muscleWeight, notes } = req.body;
  try {
    const metric = new FitnessMetric({
      client: req.user.id,
      date,
      weight,
      bodyFat,
      muscleWeight,
      notes
    });
    await metric.save();
    res.json(metric);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/fitness-metrics/:id', auth, async (req, res) => {
  try {
    const metric = await FitnessMetric.findById(req.params.id);
    if (!metric || metric.client.toString() !== req.user.id) return res.status(403).json({ msg: 'Access denied' });
    await FitnessMetric.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Goals with progress
router.get('/goals', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ client: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/goals', auth, async (req, res) => {
  const { title, description, weightLoss, duration, sessionsPerWeek } = req.body;
  try {
    const goal = new Goal({
      client: req.user.id,
      title,
      description,
      weightLoss,
      duration,
      sessionsPerWeek
    });
    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/goals/:id', auth, async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id);
    if (!goal || goal.client.toString() !== req.user.id) return res.status(403).json({ msg: 'Access denied' });
    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;