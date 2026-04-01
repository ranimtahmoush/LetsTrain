import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
  Alert
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

const CreateClass = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    maxParticipants: 10,
    price: '',
    date: '',
    duration: 60,
    location: '',
    level: 'All Levels',
    equipment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/classes', form, {
        headers: { 'x-auth-token': token }
      });

      alert('Class created successfully!');
      navigate('/my-classes');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error creating class');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/trainers');
  };

  return (
    <Box sx={{ mb: 4 }}>
      <AppBar position="static" sx={{ mb: 4, backgroundColor: '#e53935' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#fff' }}>Create Group Class</Typography>
          <Button sx={{ color: '#fff' }} onClick={() => navigate('/trainer-dashboard')}>
            Back to Dashboard
          </Button>
          <Button sx={{ color: '#fff' }} onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Paper sx={{ p: 4, border: '2px solid #e53935' }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center', color: '#e53935' }}>
            Create New Group Class
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, color: '#e53935' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={onSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Class Title"
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  required
                  placeholder="e.g., Morning Yoga Flow"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  multiline
                  rows={4}
                  required
                  placeholder="Describe what participants will do in this class"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={form.category}
                    onChange={onChange}
                    label="Category"
                  >
                    <MenuItem value="Yoga">Yoga</MenuItem>
                    <MenuItem value="Pilates">Pilates</MenuItem>
                    <MenuItem value="HIIT">HIIT</MenuItem>
                    <MenuItem value="Strength Training">Strength Training</MenuItem>
                    <MenuItem value="Cardio">Cardio</MenuItem>
                    <MenuItem value="Dance">Dance</MenuItem>
                    <MenuItem value="Meditation">Meditation</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty Level</InputLabel>
                  <Select
                    name="level"
                    value={form.level}
                    onChange={onChange}
                    label="Difficulty Level"
                  >
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Advanced">Advanced</MenuItem>
                    <MenuItem value="All Levels">All Levels</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maximum Participants"
                  name="maxParticipants"
                  type="number"
                  value={form.maxParticipants}
                  onChange={onChange}
                  required
                  inputProps={{ min: 1, max: 50 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price per Person ($)"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={onChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date & Time"
                  name="date"
                  type="datetime-local"
                  value={form.date}
                  onChange={onChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={form.duration}
                  onChange={onChange}
                  required
                  inputProps={{ min: 15, max: 180 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={form.location}
                  onChange={onChange}
                  required
                  placeholder="e.g., Downtown Fitness Studio, Beirut"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Equipment Needed (optional)"
                  name="equipment"
                  value={form.equipment}
                  onChange={onChange}
                  placeholder="e.g., Yoga mat, dumbbells, resistance bands"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    sx={{ borderColor: '#e53935', color: '#e53935', '&:hover': { borderColor: '#b71c1c', color: '#b71c1c' } }}
                    onClick={() => navigate('/trainer-dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ backgroundColor: '#e53935', color: '#fff', '&:hover': { backgroundColor: '#b71c1c' } }}
                  >
                    {loading ? 'Creating...' : 'Create Class'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreateClass;