const express = require('express');
const Class = require('../models/Class');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all active classes
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find({ status: 'active' })
      .populate('trainer', 'name')
      .sort({ date: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get class by id
router.get('/:id', async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('trainer', 'name location')
      .populate('participants.user', 'name');
    if (!classItem) return res.status(404).json({ msg: 'Class not found' });
    res.json(classItem);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create class (trainer only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'trainer') return res.status(403).json({ msg: 'Access denied' });

  const { title, description, category, maxParticipants, price, date, duration, location, level, equipment } = req.body;

  try {
    const newClass = new Class({
      trainer: req.user.id,
      title,
      description,
      category,
      maxParticipants,
      price,
      date,
      duration,
      location,
      level,
      equipment
    });

    const savedClass = await newClass.save();
    await savedClass.populate('trainer', 'name');
    res.json(savedClass);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update class (trainer only)
router.put('/:id', auth, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem || classItem.trainer.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const updates = req.body;
    Object.assign(classItem, updates);
    await classItem.save();
    await classItem.populate('trainer', 'name');
    res.json(classItem);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete/Cancel class (trainer only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem || classItem.trainer.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    classItem.status = 'cancelled';
    await classItem.save();
    res.json({ msg: 'Class cancelled' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Join class (client only)
router.post('/:id/join', auth, async (req, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ msg: 'Access denied' });

  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) return res.status(404).json({ msg: 'Class not found' });

    if (classItem.status !== 'active') return res.status(400).json({ msg: 'Class is not active' });

    if (classItem.currentParticipants >= classItem.maxParticipants) {
      return res.status(400).json({ msg: 'Class is full' });
    }

    // Check if already joined
    const alreadyJoined = classItem.participants.some(p => p.user.toString() === req.user.id);
    if (alreadyJoined) return res.status(400).json({ msg: 'Already joined this class' });

    classItem.participants.push({ user: req.user.id });
    classItem.currentParticipants += 1;
    await classItem.save();

    await classItem.populate('trainer', 'name');
    await classItem.populate('participants.user', 'name');
    res.json(classItem);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Leave class (client only)
router.post('/:id/leave', auth, async (req, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ msg: 'Access denied' });

  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) return res.status(404).json({ msg: 'Class not found' });

    const participantIndex = classItem.participants.findIndex(p => p.user.toString() === req.user.id);
    if (participantIndex === -1) return res.status(400).json({ msg: 'Not joined this class' });

    classItem.participants.splice(participantIndex, 1);
    classItem.currentParticipants -= 1;
    await classItem.save();

    res.json({ msg: 'Left class successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get trainer's classes (public route for profile viewing)
router.get('/trainer/:trainerId', async (req, res) => {
  try {
    const classes = await Class.find({ trainer: req.params.trainerId })
      .populate('participants.user', 'name')
      .sort({ date: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get trainer's classes
router.get('/trainer/my-classes', auth, async (req, res) => {
  if (req.user.role !== 'trainer') return res.status(403).json({ msg: 'Access denied' });

  try {
    const classes = await Class.find({ trainer: req.user.id })
      .populate('participants.user', 'name')
      .sort({ date: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get client's joined classes
router.get('/client/my-bookings', auth, async (req, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ msg: 'Access denied' });

  try {
    const classes = await Class.find({
      'participants.user': req.user.id,
      status: { $in: ['active', 'completed'] }
    })
      .populate('trainer', 'name')
      .sort({ date: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;