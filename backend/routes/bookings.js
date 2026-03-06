const express = require('express');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const router = express.Router();

// Get bookings for user
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ client: req.user.id }, { trainer: req.user.id }]
    }).populate('client', 'name').populate('trainer').populate('goal');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create booking
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ msg: 'Access denied' });

  const { trainer, goal, date, time, price } = req.body;
  try {
    const booking = new Booking({
      client: req.user.id,
      trainer,
      goal,
      date,
      time,
      price
    });
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update booking status
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    if (req.user.role === 'trainer' && booking.trainer.toString() !== req.user.id) return res.status(403).json({ msg: 'Access denied' });
    if (req.user.role === 'client' && booking.client.toString() !== req.user.id) return res.status(403).json({ msg: 'Access denied' });

    booking.status = req.body.status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;