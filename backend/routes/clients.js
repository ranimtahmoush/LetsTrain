const express = require('express');
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

const router = express.Router();

// Get client goals
router.get('/goals', auth, async (req, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ msg: 'Access denied' });

  try {
    const goals = await Goal.find({ client: req.user.id });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create goal
router.post('/goals', auth, async (req, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ msg: 'Access denied' });

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

module.exports = router;