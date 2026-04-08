import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Chip
} from '@mui/material';
import { useAuth } from './AuthContext';

const BookingModal = ({ open, onClose, trainer, trainerUser }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    date: '',
    hour: '',
    time: '',
    duration: 60,
    notes: ''
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [hourlySlots, setHourlySlots] = useState({});

  // Fetch available slots when date changes
  useEffect(() => {
    if (formData.date && trainerUser) {
      fetchAvailableSlots();
      // Reset hour and time when date changes
      setFormData(prev => ({ ...prev, hour: '', time: '' }));
    }
  }, [formData.date, trainerUser]);

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/bookings/availability/${trainerUser._id}/${formData.date}`
      );
      const slots = response.data.availableSlots || [];
      setAvailableSlots(slots);
      
      // Group slots by hour
      const grouped = {};
      for (let hour = 9; hour < 18; hour++) {
        const hourStr = String(hour).padStart(2, '0');
        grouped[hourStr] = slots.filter(slot => slot.startsWith(hourStr));
      }
      setHourlySlots(grouped);
      setError('');
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to fetch available slots');
      setAvailableSlots([]);
      setHourlySlots({});
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset time when hour changes
    if (name === 'hour') {
      setFormData(prev => ({ ...prev, time: '' }));
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const calculatePrice = () => {
    if (!trainer) return 0;
    const durationHours = formData.duration / 60;
    return (trainer.pricePerSession * durationHours).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.time || !formData.duration) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user) {
      setError('You must be logged in to book a session');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const bookingData = {
        trainerId: trainerUser._id,
        date: new Date(formData.date).toISOString(),
        time: formData.time,
        duration: parseInt(formData.duration),
        notes: formData.notes
      };

      const response = await axios.post(
        'http://localhost:5000/api/bookings',
        bookingData,
        { headers: { 'x-auth-token': token } }
      );

      setSuccess('Booking confirmed! Awaiting trainer confirmation.');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message || 'Failed to create booking';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      date: '',
      hour: '',
      time: '',
      duration: 60,
      notes: ''
    });
    setAvailableSlots([]);
    setHourlySlots({});
    setError('');
    setSuccess('');
    onClose();
  };

  if (!trainer || !trainerUser) return null;

  // Get available hours
  const availableHours = Object.keys(hourlySlots).filter(hour => hourlySlots[hour].length > 0);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ background: '#ffeaea', color: '#e53935', fontWeight: 700, fontSize: 20 }}>
        Book a Session with {trainerUser.name}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Trainer Info Card */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, background: '#f9f9f9', borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={8}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {trainerUser.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#888' }}>
                ${trainer.pricePerSession} per hour
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              <Chip 
                label={`${trainer.experience || 0}y exp`} 
                size="small" 
                sx={{ background: '#ffeaea', color: '#e53935' }} 
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Date Selection */}
        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: '#e53935' }}>
          Select Date
        </Typography>
        <TextField
          fullWidth
          name="date"
          type="date"
          value={formData.date}
          onChange={handleInputChange}
          inputProps={{ min: getTodayDate() }}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
        />

        {/* Hour Selection */}
        {formData.date && (
          <>
            {loadingSlots ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <CircularProgress size={30} />
              </Box>
            ) : availableHours.length > 0 ? (
              <>
                <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: '#e53935' }}>
                  Select Hour
                </Typography>
                <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                  {availableHours.map(hour => {
                    const displayHour = parseInt(hour);
                    const ampm = displayHour >= 12 ? 'PM' : 'AM';
                    const displayNum = displayHour > 12 ? displayHour - 12 : displayHour === 0 ? 12 : displayHour;
                    return (
                      <Button
                        key={hour}
                        variant={formData.hour === hour ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleInputChange({ target: { name: 'hour', value: hour } })}
                        sx={{
                          borderRadius: 2,
                          borderColor: '#e53935',
                          color: formData.hour === hour ? '#fff' : '#e53935',
                          background: formData.hour === hour ? '#e53935' : '#fff',
                          '&:hover': {
                            background: formData.hour === hour ? '#b71c1c' : '#f9f9f9'
                          }
                        }}
                      >
                        {displayNum} {ampm}
                      </Button>
                    );
                  })}
                </Box>
              </>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No available slots for this date
              </Alert>
            )}
          </>
        )}

        {/* Time Selection (30-min slots within selected hour) */}
        {formData.hour && hourlySlots[formData.hour] && hourlySlots[formData.hour].length > 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: '#e53935' }}>
              Select Time
            </Typography>
            <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
              {hourlySlots[formData.hour].map(slot => (
                <Button
                  key={slot}
                  variant={formData.time === slot ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setFormData(prev => ({ ...prev, time: slot }))}
                  sx={{
                    borderRadius: 2,
                    borderColor: '#e53935',
                    color: formData.time === slot ? '#fff' : '#e53935',
                    background: formData.time === slot ? '#e53935' : '#fff',
                    '&:hover': {
                      background: formData.time === slot ? '#b71c1c' : '#f9f9f9'
                    }
                  }}
                >
                  {slot}
                </Button>
              ))}
            </Box>
          </>
        )}

        {/* Duration Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Duration</InputLabel>
          <Select
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            label="Duration"
          >
            <MenuItem value={30}>30 minutes</MenuItem>
            <MenuItem value={45}>45 minutes</MenuItem>
            <MenuItem value={60}>1 hour</MenuItem>
          </Select>
        </FormControl>

        {/* Notes */}
        <TextField
          fullWidth
          label="Notes (optional)"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          multiline
          rows={3}
          placeholder="Tell the trainer about your fitness goals, injuries, or preferences..."
          sx={{ mb: 2 }}
        />

        {/* Price Summary */}
        <Paper elevation={0} sx={{ p: 2, background: '#ffeaea', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#888', mb: 0.5 }}>
            Total Price
          </Typography>
          <Typography variant="h5" sx={{ color: '#e53935', fontWeight: 700 }}>
            ${calculatePrice()}
          </Typography>
          <Typography variant="caption" sx={{ color: '#999' }}>
            For {formData.duration} minutes
          </Typography>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} sx={{ color: '#888', fontWeight: 600, borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.date || !formData.time}
          sx={{
            background: '#e53935',
            color: '#fff',
            fontWeight: 700,
            borderRadius: 2,
            '&:hover': { background: '#b71c1c' },
            '&:disabled': { background: '#ccc' }
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          {loading ? 'Booking...' : 'Confirm Booking'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingModal;
