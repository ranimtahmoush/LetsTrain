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
    const reviews = await Review.find({ trainer: req.params.id }).populate('client', 'name email profilePicture');
    
    console.log('=== TRAINER PROFILE FETCH ===');
    console.log('Trainer ID:', req.params.id);
    console.log('Review count:', reviews.length);
    reviews.forEach((r, idx) => {
      console.log(`Review ${idx}:`, {
        _id: r._id,
        rating: r.rating,
        clientId: r.client?._id,
        clientName: r.client?.name,
        clientEmail: r.client?.email
      });
    });
    
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

// Submit a review for a trainer (metrics optional)
router.post('/:id/reviews', auth, async (req, res) => {
  const { rating, comment, metrics } = req.body;
  
  console.log('=== REVIEW SUBMISSION ===');
  console.log('Trainer ID:', req.params.id);
  console.log('Client ID:', req.user.id);
  console.log('Rating:', rating);
  console.log('Comment:', comment);
  console.log('Metrics:', metrics);
  
  try {
    // Check if user already reviewed this trainer
    const existingReview = await Review.findOne({
      trainer: req.params.id,
      client: req.user.id
    });
    
    if (existingReview) {
      console.log('ERROR: User already reviewed this trainer');
      return res.status(400).json({ msg: 'You have already submitted a review for this trainer. You can only review once.' });
    }
    
    const review = new Review({
      trainer: req.params.id,
      client: req.user.id,
      rating,
      comment,
      metrics,
      createdAt: new Date()
    });
    
    console.log('Saving review...');
    await review.save();
    console.log('Review saved successfully:', review._id);
    
    res.status(201).json(review);
  } catch (err) {
    console.error('Review save error:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
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