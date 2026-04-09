import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Box, Typography, Button, TextField, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const Booking = () => {
  const { trainerId } = useParams();
  const [form, setForm] = useState({ date: '', time: '', price: 50 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
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
      setError('Booking failed: ' + (err.response?.data?.msg || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 2px 12px rgba(229,57,53,0.08)' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e53935', mb: 3, textAlign: 'center' }}>
            Book a Session
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <DatePicker
              label="Select Date"
              value={form.date ? dayjs(form.date) : null}
              onChange={(newDate) => {
                if (newDate) {
                  setForm({ ...form, date: newDate.format('YYYY-MM-DD') });
                }
              }}
              minDate={dayjs()}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />

            <TimePicker
              label="Select Time"
              value={form.time ? dayjs(`2024-01-01 ${form.time}`) : null}
              onChange={(newTime) => {
                if (newTime) {
                  setForm({ ...form, time: newTime.format('HH:mm') });
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />

            <TextField
              type="number"
              label="Price"
              name="price"
              value={form.price}
              onChange={onChange}
              required
              fullWidth
              InputProps={{ min: 0 }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading || !form.date || !form.time}
              sx={{
                backgroundColor: '#e53935',
                color: '#fff',
                fontWeight: 700,
                py: 1.5,
                borderRadius: 2,
                mt: 2,
                '&:hover': { backgroundColor: '#b71c1c' }
              }}
            >
              {loading ? 'Booking...' : 'Book and Pay'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default Booking;