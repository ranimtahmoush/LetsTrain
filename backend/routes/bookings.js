const express = require('express');
const Booking = require('../models/Booking');
const Trainer = require('../models/Trainer');
const auth = require('../middleware/auth');

const router = express.Router();

// Get bookings for user
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ client: req.user.id }, { trainerUser: req.user.id }]
    }).populate('client', 'name email').populate('trainer').populate('trainerUser', 'name email').populate('goal').sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get bookings for a specific trainer
router.get('/trainer/:trainerId', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ trainerUser: req.params.trainerId })
      .populate('client', 'name email')
      .populate('trainer')
      .sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get available time slots for a trainer on a specific date
router.get('/availability/:trainerId/:date', async (req, res) => {
  try {
    const { trainerId, date } = req.params;
    
    // Parse the date string (format: YYYY-MM-DD)
    const [year, month, day] = date.split('-');
    const bookingDate = new Date(year, parseInt(month) - 1, day);
    bookingDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);

    console.log('Checking availability for:', { trainerId, date, bookingDate, nextDay });

    const bookings = await Booking.find({
      trainerUser: trainerId,
      date: { $gte: bookingDate, $lt: nextDay },
      status: { $in: ['confirmed', 'pending'] }
    });

    console.log('Found bookings:', bookings.length);

    // Generate available time slots (9 AM to 6 PM, 30-min intervals)
    const slots = [];
    const bookedTimes = new Set(bookings.map(b => b.time));
    
    for (let hour = 9; hour < 18; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        if (!bookedTimes.has(timeStr)) {
          slots.push(timeStr);
        }
      }
    }

    console.log('Available slots:', slots);
    res.json({ availableSlots: slots });
  } catch (err) {
    console.error('Availability error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Create booking
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ msg: 'Access denied - only clients can book' });

  const { trainerId, trainerId: trainerMongoId, date, time, duration, notes } = req.body;
  
  if (!trainerId || !date || !time || !duration) {
    return res.status(400).json({ msg: 'Missing required fields: trainerId, date, time, duration' });
  }

  if (![30, 45, 60].includes(parseInt(duration))) {
    return res.status(400).json({ msg: 'Duration must be 30, 45, or 60 minutes' });
  }

  try {
    // Find the trainer
    const trainer = await Trainer.findOne({ user: trainerId });
    if (!trainer) return res.status(404).json({ msg: 'Trainer not found' });

    // Check if slot is already booked
    const existingBooking = await Booking.findOne({
      trainerUser: trainerId,
      date: new Date(date),
      time: time,
      status: { $in: ['confirmed', 'pending'] }
    });

    if (existingBooking) {
      return res.status(400).json({ msg: 'This time slot is already booked' });
    }

    // Calculate price
    const durationHours = duration / 60;
    const totalPrice = trainer.pricePerSession * durationHours;

    const booking = new Booking({
      client: req.user.id,
      trainer: trainer._id,
      trainerUser: trainerId,
      date: new Date(date),
      time,
      duration: parseInt(duration),
      price: totalPrice,
      notes: notes || ''
    });

    await booking.save();
    await booking.populate('trainer').populate('trainerUser', 'name email');
    
    res.json(booking);
  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Update booking status
router.put('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    // Check authorization
    if (req.user.role === 'trainer') {
      if (booking.trainerUser.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Access denied' });
      }
    } else if (req.user.role === 'client') {
      if (booking.client.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Access denied' });
      }
    }

    // Update status
    if (req.body.status) {
      booking.status = req.body.status;
    }

    // Update notes if provided
    if (req.body.notes !== undefined) {
      booking.notes = req.body.notes;
    }

    booking.updatedAt = Date.now();
    await booking.save();
    await booking.populate('trainer').populate('trainerUser', 'name email');
    
    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Cancel booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    // Check authorization
    if (booking.client.toString() !== req.user.id && booking.trainerUser.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    booking.status = 'cancelled';
    booking.updatedAt = Date.now();
    await booking.save();

    res.json({ msg: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;