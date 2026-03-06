const express = require('express');
const Trainer = require('../models/Trainer');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all trainers
router.get('/', async (req, res) => {
  try {
    const trainers = await Trainer.find().populate('user').sort({ rating: -1 });
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get current trainer profile
router.get('/profile/me', auth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer') return res.status(403).json({ msg: 'Access denied' });
    const trainer = await Trainer.findOne({ user: req.user.id }).populate('user');
    if (!trainer) return res.status(404).json({ msg: 'Trainer profile not found' });
    res.json(trainer);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get trainer by id
router.get('/:id', async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id).populate('user');
    const reviews = await Review.find({ trainer: req.params.id }).populate('client', 'name');
    res.json({ trainer, reviews });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create trainer profile (for authenticated trainer)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'trainer') return res.status(403).json({ msg: 'Access denied' });

  const { portfolio, bio, specialties, experience, pricePerSession } = req.body;
  try {
    const trainer = new Trainer({
      user: req.user.id,
      portfolio,
      bio,
      specialties,
      experience,
      pricePerSession
    });
    await trainer.save();
    res.json(trainer);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update trainer profile
router.put('/:id', auth, async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer || trainer.user.toString() !== req.user.id) return res.status(403).json({ msg: 'Access denied' });

    const updates = req.body;
    Object.assign(trainer, updates);
    await trainer.save();
    res.json(trainer);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;