const express = require('express');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const router = express.Router();

// Process payment (mock)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'client') return res.status(403).json({ msg: 'Access denied' });

  const { bookingId } = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.client.toString() !== req.user.id) return res.status(403).json({ msg: 'Access denied' });

    const commission = booking.price * booking.commission;
    const trainerAmount = booking.price - commission;

    const payment = new Payment({
      booking: bookingId,
      amount: booking.price,
      commission,
      trainerAmount,
      status: 'paid' // Mock as paid
    });
    await payment.save();

    booking.status = 'confirmed';
    await booking.save();

    res.json({ payment, booking });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;