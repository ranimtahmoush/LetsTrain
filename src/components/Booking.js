import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const Booking = () => {
  const { trainerId } = useParams();
  const [form, setForm] = useState({ date: '', time: '', price: 50 }); // Assume price
  const navigate = useNavigate();

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('http://localhost:5000/api/bookings', { ...form, trainer: trainerId }, {
        headers: { 'x-auth-token': token }
      });
      // Then pay
      await axios.post('http://localhost:5000/api/payments', { bookingId: res.data._id }, {
        headers: { 'x-auth-token': token }
      });
      navigate('/client-dashboard');
    } catch (err) {
      alert('Booking failed');
    }
  };

  return (
    <div>
      <h2>Book Session</h2>
      <form onSubmit={onSubmit}>
        <input type="date" name="date" onChange={onChange} required />
        <input type="time" name="time" onChange={onChange} required />
        <input type="number" name="price" placeholder="Price" onChange={onChange} required />
        <button type="submit">Book and Pay</button>
      </form>
    </div>
  );
};

export default Booking;