import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  AppBar,
  Toolbar,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from './AuthContext';

const Register = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', location: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      // Send firstName and lastName as separate fields, or combine if backend expects 'name'
      const payload = { ...form, name: form.firstName + ' ' + form.lastName, role: 'client' };
      const res = await axios.post('http://localhost:5000/api/auth/register', payload);
      login(res.data.token);
      navigate('/'); // Redirect to homepage after registration
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#e53935', color: '#fff' }}>
        <Toolbar>
          <FitnessCenterIcon sx={{ mr: 2, color: '#fff' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            LetsTrain
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 4,
          background: 'linear-gradient(155deg, #fff6f6 0%, #ffffff 48%, #ffecec 100%)',
        }}
      >
        <Container component="main" maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: '12px',
              boxShadow: '0 14px 34px rgba(229, 57, 53, 0.15)',
              border: '1px solid rgba(229, 57, 53, 0.08)',
            }}
          >
            <Typography component="h1" variant="h4" align="center" sx={{ fontWeight: 700, color: '#d32f2f' }}>
              Create your LetsTrain account
            </Typography>
            <Typography align="center" sx={{ mt: 1.25, color: '#7a4a4a', fontSize: '0.96rem' }}>
              Start finding trainers and fitness classes near you.
            </Typography>

            <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                autoFocus
                onChange={onChange}
                sx={{ mb: { xs: 0, sm: 2 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color: '#d32f2f' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                onChange={onChange}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color: '#d32f2f' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              onChange={onChange}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: '#d32f2f' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              onChange={onChange}
              sx={{ mb: 0.75 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: '#d32f2f' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(prev => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Typography sx={{ mb: 2, color: '#8a5555', fontSize: '0.82rem' }}>
              Password must contain at least 8 characters.
            </Typography>

            <TextField
              fullWidth
              id="location"
              label="Location"
              name="location"
              onChange={onChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              id="phone"
              label="Phone"
              name="phone"
              onChange={onChange}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneOutlinedIcon sx={{ color: '#d32f2f' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 1,
                mb: 2,
                height: 50,
                backgroundColor: '#e53935',
                color: '#fff',
                fontWeight: 700,
                boxShadow: '0 8px 18px rgba(229, 57, 53, 0.3)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  backgroundColor: '#d32f2f',
                  boxShadow: '0 10px 22px rgba(211, 47, 47, 0.35)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Sign Up
            </Button>

            <Box sx={{ my: 2 }}>
              <Divider>
                <Typography sx={{ color: '#b06b6b', fontWeight: 600, fontSize: '0.86rem' }}>OR</Typography>
              </Divider>
            </Box>

            <Button
              type="button"
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              sx={{
                mb: 2,
                height: 48,
                borderColor: '#ef9a9a',
                color: '#b71c1c',
                fontWeight: 600,
                textTransform: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#e53935',
                  backgroundColor: '#fff5f5',
                },
              }}
            >
              Continue with Google
            </Button>

            <Button component={Link} to="/login" fullWidth sx={{ color: '#e53935', fontWeight: 'bold', textTransform: 'none' }}>
              Already have an account? Sign In
            </Button>
          </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default Register;