import React, { useState } from 'react';
import axios from 'axios';
import {
  Container, Box, Typography, TextField, Button, Paper, Grid, Divider, Checkbox, FormControlLabel, MenuItem, Select, InputLabel, FormControl, Chip, IconButton, InputAdornment
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useNavigate } from 'react-router-dom';

const specialtiesList = [
  'Strength Training', 'Cardio', 'Yoga', 'Pilates', 'HIIT', 'Weight Loss', 'CrossFit', 'Boxing', 'Rehabilitation', 'Nutrition Coaching',
  'Bodybuilding', 'Endurance', 'Mobility', 'Stretching', 'Aerobics', 'TRX', 'Functional Training', 'Powerlifting', 'Zumba', 'Martial Arts',
];

const currencies = ['$', '€', '£', 'LBP', 'AED', 'SAR'];
const phoneCodes = ['+961', '+1', '+44', '+33', '+49', '+971', '+966', '+20', '+90', '+34', '+39', '+7', '+86', '+91', '+61', '+81', '+82', '+974', '+973', '+962', '+965', '+968', '+964', '+63', '+66', '+62', '+880', '+92', '+94', '+880', '+48', '+351', '+358', '+46', '+47', '+48', '+31', '+32', '+41', '+43', '+420', '+421', '+36', '+40', '+48', '+420', '+421', '+48', '+48'];
const countries = ['Lebanon', 'USA', 'UK', 'France', 'Germany', 'UAE', 'KSA', 'Other'];

const TrainerPortalRegister = () => {
  const navigate = useNavigate();
  const [profileImg, setProfileImg] = useState(null);
  const [coverImg, setCoverImg] = useState(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', website: '', gymName: '', displayName: '', email: '', hideEmail: false,
    phoneCode: '', phone: '', hidePhone: false, password: '', confirmPassword: '', currency: '', minCharge: '',
    bio: '',
    specialties: [], country: '', area: '', city: '', street: '', building: '', floor: '', facebook: '', instagram: '', certificates: [],
    agreePrivacy: false, agreeTerms: false
  });
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const [certificates, setCertificates] = useState([]);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const handleSpecialtyToggle = (spec) => {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(spec)
        ? prev.specialties.filter((s) => s !== spec)
        : [...prev.specialties, spec],
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'profile') setProfileImg(file);
    else if (type === 'cover') setCoverImg(file);
  };

  const handleCertificatesChange = (e) => {
    setCertificates([...certificates, ...Array.from(e.target.files)]);
  };

  const [showSignup, setShowSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: form.email,
        password: form.password
      });
      localStorage.setItem('token', res.data.token);
      setSuccess('Login successful!');
      setTimeout(() => navigate('/trainer-dashboard'), 1000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Validation
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword || !form.city || !form.phoneCode || !form.phone) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      // Register user as trainer
      const name = `${form.firstName} ${form.lastName}`;
      const userRes = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email: form.email,
        password: form.password,
        role: 'trainer',
        location: form.city,
        phone: `${form.phoneCode} ${form.phone}`
      });
      localStorage.setItem('token', userRes.data.token);
      // Create trainer profile
      const token = userRes.data.token;
      await axios.post('http://localhost:5000/api/trainers', {
        bio: form.bio,
        specialties: form.specialties,
        experience: 0,
        pricePerSession: form.minCharge,
        portfolio: [],
        certificates: certificates.map(f => f.name)
      }, { headers: { 'x-auth-token': token } });
      setSuccess('Registration successful!');
      // Reset form after registration
      setForm({
        firstName: '', lastName: '', website: '', gymName: '', displayName: '', email: '', hideEmail: false,
        phoneCode: '', phone: '', hidePhone: false, password: '', confirmPassword: '', currency: '', minCharge: '',
        bio: '', specialties: [], country: '', area: '', city: '', street: '', building: '', floor: '', facebook: '', instagram: '', certificates: [],
        agreePrivacy: false, agreeTerms: false
      });
      setCertificates([]);
      setTimeout(() => navigate('/trainer-dashboard'), 1000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const sectionCardSx = {
    borderRadius: 3,
    p: { xs: 1.8, sm: 2.2 },
    border: '1px solid rgba(229, 57, 53, 0.1)',
    bgcolor: '#fff',
    boxShadow: '0 8px 18px rgba(60, 38, 38, 0.06)',
  };

  const sectionTitleSx = {
    fontWeight: 800,
    mb: 1.8,
    color: '#2a2a2a',
    fontSize: '1.25rem',
    letterSpacing: '-0.01em',
  };

  const uploadDropzoneSx = {
    border: '2px dashed rgba(229, 57, 53, 0.45)',
    borderRadius: 2.4,
    p: 2.6,
    textAlign: 'center',
    cursor: 'pointer',
    minHeight: 170,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    bgcolor: '#fffafa',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#fff6f6',
      borderColor: 'rgba(229, 57, 53, 0.62)',
      boxShadow: '0 8px 16px rgba(229, 57, 53, 0.08)',
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 3, md: 7 },
        px: 2,
        background: 'radial-gradient(circle at 12% 8%, rgba(244, 67, 54, 0.08) 0%, transparent 38%), linear-gradient(165deg, #fdfbf9 0%, #fffefc 52%, #fff6f6 100%)',
      }}
    >
      <Container maxWidth="xl">
        <Paper
          elevation={0}
          sx={{
            borderRadius: '16px',
            p: { xs: 2.75, sm: 4.25, md: 5.25 },
            boxShadow: '0 20px 46px rgba(34, 22, 22, 0.1)',
            border: '1px solid rgba(229, 57, 53, 0.08)',
            maxWidth: showSignup ? 1380 : 860,
            mx: 'auto',
            background: 'linear-gradient(180deg, #ffffff 0%, #fffdfd 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -60,
              right: -90,
              width: 240,
              height: 240,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(229, 57, 53, 0.12) 0%, rgba(229, 57, 53, 0) 68%)',
              pointerEvents: 'none',
            },
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.05,
                px: 1.9,
                py: 0.78,
                borderRadius: 999,
                fontSize: '0.94rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#b71c1c',
                bgcolor: '#ffebee',
                border: '1px solid #ffcdd2',
                mb: 1.7,
                boxShadow: '0 4px 10px rgba(183, 28, 28, 0.12)',
              }}
            >
              <BadgeOutlinedIcon sx={{ fontSize: 22 }} />
              For Trainers
            </Box>

            <Typography
              variant="h4"
              align="center"
              sx={{
                fontWeight: 800,
                color: '#e53935',
                mb: 1.2,
                letterSpacing: '-0.015em',
                fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
              }}
            >
              Trainer Portal
            </Typography>
            <Typography sx={{ color: '#907d7d', maxWidth: 560, mx: 'auto', fontSize: '0.95rem', lineHeight: 1.72 }}>
              Manage your profile, classes, bookings, and client requests in one place.
            </Typography>
          </Box>
          <Divider sx={{ mb: 3.5, borderColor: 'rgba(120, 72, 72, 0.16)' }} />
        {!showSignup ? (
          <React.Fragment>
            {error && (
              <Box sx={{ p: 1.5, mb: 3, backgroundColor: '#ffebee', borderRadius: '8px', border: '1px solid #ef5350' }}>
                <Typography sx={{ color: '#c62828', fontSize: '0.9rem', fontWeight: 500 }}>
                  {error}
                </Typography>
              </Box>
            )}
            {success && (
              <Box sx={{ p: 1.5, mb: 3, backgroundColor: '#e8f5e9', borderRadius: '8px', border: '1px solid #66bb6a' }}>
                <Typography sx={{ color: '#2e7d32', fontSize: '0.9rem', fontWeight: 500 }}>
                  {success}
                </Typography>
              </Box>
            )}
            <Grid container spacing={{ xs: 2.75, md: 3.5 }} alignItems="stretch">
              <Grid item xs={12} md={5}>
                <Box sx={{ p: { xs: 0.5, sm: 1.2 }, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.7)' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#2b2b2b' }}>Sign In</Typography>
                  <form onSubmit={handleLogin}>
                    <Box sx={{ display: 'grid', gap: 2.25 }}>
                    <TextField
                      label="Email Address"
                      name="email"
                      value={form.email}
                      onChange={handleInput}
                      required
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlinedIcon sx={{ color: '#d32f2f' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          minHeight: 56,
                          borderRadius: 2.3,
                          backgroundColor: '#fff',
                          '& fieldset': { borderColor: '#f0b4b4' },
                          '&:hover fieldset': { borderColor: '#e79999' },
                          '&.Mui-focused fieldset': { borderColor: '#d84b4b', borderWidth: '1px' },
                        },
                      }}
                    />
                    <TextField
                      label="Password"
                      name="password"
                      value={form.password}
                      onChange={handleInput}
                      type={showPassword ? 'text' : 'password'}
                      required
                      fullWidth
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          minHeight: 56,
                          borderRadius: 2.3,
                          backgroundColor: '#fff',
                          '& fieldset': { borderColor: '#f0b4b4' },
                          '&:hover fieldset': { borderColor: '#e79999' },
                          '&.Mui-focused fieldset': { borderColor: '#d84b4b', borderWidth: '1px' },
                        },
                      }}
                    />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.2, mb: 2.7 }}>
                    <Button
                      type="button"
                      sx={{ color: '#c83333', fontWeight: 700, textTransform: 'none', px: 0, minWidth: 'auto' }}
                    >
                      Forgot password?
                    </Button>
                    </Box>

                    <Box sx={{ mb: 1.6 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{
                        background: 'linear-gradient(90deg, #eb3b37 0%, #e53935 55%, #dc2f2f 100%)',
                        fontWeight: 'bold',
                        fontSize: 17,
                        minHeight: 56,
                        borderRadius: 2.3,
                        boxShadow: '0 12px 24px rgba(229, 57, 53, 0.28)',
                        transition: 'all 0.28s ease',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #df332f 0%, #d53030 60%, #c62828 100%)',
                          boxShadow: '0 14px 28px rgba(211, 47, 47, 0.36)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                    </Box>

                    <Typography align="center" sx={{ mt: 2.1 }}>
                    Don't have an account?{' '}
                    <Button variant="text" sx={{ color: '#e53935', fontWeight: 'bold', textTransform: 'none' }} onClick={() => setShowSignup(true)}>
                      Sign Up
                    </Button>
                    </Typography>
                  </form>
                </Box>

                {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                {success && <Typography color="success.main" sx={{ mt: 2 }}>{success}</Typography>}
              </Grid>

              <Grid item xs={12} md={7}>
                <Box
                  sx={{
                    borderRadius: 3.9,
                    bgcolor: 'rgba(255, 232, 232, 0.98)',
                    p: { xs: 2.8, sm: 3.8, md: 4.4 },
                    height: '100%',
                    boxShadow: '0 16px 32px rgba(183, 28, 28, 0.11)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                  }}
                >
                  <Typography sx={{ fontWeight: 700, color: '#b71c1c', mb: 2, fontSize: '1.08rem' }}>Why trainers choose LetsTrain</Typography>
                  <Box sx={{ display: 'grid', gap: 2.8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.45, p: 1.2, borderRadius: 2.2, backgroundColor: 'rgba(255,255,255,0.46)' }}>
                      <CalendarMonthOutlinedIcon sx={{ color: '#e53935', fontSize: 28 }} />
                      <Typography variant="body2" sx={{ fontSize: '0.98rem' }}>Create and manage classes</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.45, p: 1.2, borderRadius: 2.2, backgroundColor: 'rgba(255,255,255,0.46)' }}>
                      <EventAvailableOutlinedIcon sx={{ color: '#e53935', fontSize: 28 }} />
                      <Typography variant="body2" sx={{ fontSize: '0.98rem' }}>Receive bookings from clients</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.45, p: 1.2, borderRadius: 2.2, backgroundColor: 'rgba(255,255,255,0.46)' }}>
                      <TrendingUpOutlinedIcon sx={{ color: '#e53935', fontSize: 28 }} />
                      <Typography variant="body2" sx={{ fontSize: '0.98rem' }}>Grow your fitness business</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.8, textAlign: 'center', color: '#b71c1c' }}>
              Trainer Registration
            </Typography>
            <Typography sx={{ textAlign: 'center', mb: 3.2, color: '#8c7373', fontSize: '0.95rem' }}>
              Build your profile and start receiving client bookings.
            </Typography>

            {error && (
              <Box sx={{ p: 1.5, mb: 2.5, backgroundColor: '#ffebee', borderRadius: '8px', border: '1px solid #ef5350' }}>
                <Typography sx={{ color: '#c62828', fontSize: '0.9rem', fontWeight: 500 }}>
                  {error}
                </Typography>
              </Box>
            )}
            {success && (
              <Box sx={{ p: 1.5, mb: 2.5, backgroundColor: '#e8f5e9', borderRadius: '8px', border: '1px solid #66bb6a' }}>
                <Typography sx={{ color: '#2e7d32', fontSize: '0.9rem', fontWeight: 500 }}>
                  {success}
                </Typography>
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              <Box
                sx={{
                  ...sectionCardSx,
                  bgcolor: 'rgba(255, 250, 250, 0.95)',
                  p: { xs: 2.4, sm: 3.2 },
                  mb: 2.8,
                  borderRadius: 3.2,
                  border: '1px solid rgba(229, 57, 53, 0.08)',
                  boxShadow: '0 6px 20px rgba(211, 47, 47, 0.05)',
                }}
              >
                <Typography variant="h6" sx={{...sectionTitleSx, mb: 2.8}}>Profile Setup</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1.4, color: '#2a2a2a', fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                        Profile Image <span style={{ color: '#aaa', fontSize: 12, fontWeight: 500, textTransform: 'none' }}>(515x345px)</span>
                      </Typography>
                      <Box
                        sx={{
                          ...uploadDropzoneSx,
                          minHeight: 190,
                          border: '2px dashed rgba(229, 57, 53, 0.35)',
                          borderRadius: 2.8,
                          p: 3,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(135deg, transparent 48%, rgba(229, 57, 53, 0.02) 49%, rgba(229, 57, 53, 0.02) 51%, transparent 52%)',
                            pointerEvents: 'none',
                          },
                        }}
                        onClick={() => document.getElementById('profile-img-input').click()}
                      >
                        <CloudUploadIcon sx={{ fontSize: 56, color: '#e53935', mb: 1.2, opacity: 0.9 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#2a2a2a', mb: 0.4 }}>Click or drop to upload</Typography>
                        <Typography variant="caption" sx={{ color: '#999', fontSize: '0.85rem' }}>Profile Image</Typography>
                        <input
                          id="profile-img-input"
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => handleFileChange(e, 'profile')}
                        />
                        {profileImg && <Typography variant="caption" sx={{ display: 'block', mt: 1.2, color: '#e53935', fontWeight: 600 }}>✓ {profileImg.name}</Typography>}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1.4, color: '#2a2a2a', fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                        Cover Image <span style={{ color: '#aaa', fontSize: 12, fontWeight: 500, textTransform: 'none' }}>(788x250px)</span>
                      </Typography>
                      <Box
                        sx={{
                          ...uploadDropzoneSx,
                          minHeight: 190,
                          border: '2px dashed rgba(229, 57, 53, 0.35)',
                          borderRadius: 2.8,
                          p: 3,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(135deg, transparent 48%, rgba(229, 57, 53, 0.02) 49%, rgba(229, 57, 53, 0.02) 51%, transparent 52%)',
                            pointerEvents: 'none',
                          },
                        }}
                        onClick={() => document.getElementById('cover-img-input').click()}
                      >
                        <CloudUploadIcon sx={{ fontSize: 56, color: '#e53935', mb: 1.2, opacity: 0.9 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#2a2a2a', mb: 0.4 }}>Click or drop to upload</Typography>
                        <Typography variant="caption" sx={{ color: '#999', fontSize: '0.85rem' }}>Cover Image</Typography>
                        <input
                          id="cover-img-input"
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => handleFileChange(e, 'cover')}
                        />
                        {coverImg && <Typography variant="caption" sx={{ display: 'block', mt: 1.2, color: '#e53935', fontWeight: 600 }}>✓ {coverImg.name}</Typography>}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="First Name" 
                      name="firstName" 
                      value={form.firstName} 
                      onChange={handleInput} 
                      required 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fafafa',
                          transition: 'all 0.2s ease',
                          '& fieldset': { borderColor: '#e8d4d4' },
                          '&:hover fieldset': { borderColor: '#e0c4c4' },
                          '&.Mui-focused fieldset': { borderColor: '#e53935' },
                        },
                        '& .MuiOutlinedInput-input': { fontWeight: 500 },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Last Name" 
                      name="lastName" 
                      value={form.lastName} 
                      onChange={handleInput} 
                      required 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fafafa',
                          transition: 'all 0.2s ease',
                          '& fieldset': { borderColor: '#e8d4d4' },
                          '&:hover fieldset': { borderColor: '#e0c4c4' },
                          '&.Mui-focused fieldset': { borderColor: '#e53935' },
                        },
                        '& .MuiOutlinedInput-input': { fontWeight: 500 },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField 
                      label="Trainer Name/Display Name" 
                      name="displayName" 
                      value={form.displayName} 
                      onChange={handleInput} 
                      required 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fafafa',
                          transition: 'all 0.2s ease',
                          '& fieldset': { borderColor: '#e8d4d4' },
                          '&:hover fieldset': { borderColor: '#e0c4c4' },
                          '&.Mui-focused fieldset': { borderColor: '#e53935' },
                        },
                        '& .MuiOutlinedInput-input': { fontWeight: 500 },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField 
                      label="Studio/Gym Name" 
                      name="gymName" 
                      value={form.gymName} 
                      onChange={handleInput} 
                      required 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fafafa',
                          transition: 'all 0.2s ease',
                          '& fieldset': { borderColor: '#e8d4d4' },
                          '&:hover fieldset': { borderColor: '#e0c4c4' },
                          '&.Mui-focused fieldset': { borderColor: '#e53935' },
                        },
                        '& .MuiOutlinedInput-input': { fontWeight: 500 },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField 
                      label="Website" 
                      name="website" 
                      value={form.website} 
                      onChange={handleInput} 
                      fullWidth 
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fafafa',
                          transition: 'all 0.2s ease',
                          '& fieldset': { borderColor: '#e8d4d4' },
                          '&:hover fieldset': { borderColor: '#e0c4c4' },
                          '&.Mui-focused fieldset': { borderColor: '#e53935' },
                        },
                        '& .MuiOutlinedInput-input': { fontWeight: 500 },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="About (Tell us about yourself)"
                      name="bio"
                      value={form.bio}
                      onChange={handleInput}
                      fullWidth
                      multiline
                      minRows={8}
                      maxRows={12}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2.2,
                          backgroundColor: '#fafafa',
                          transition: 'all 0.2s ease',
                          '& fieldset': { borderColor: '#e8d4d4' },
                          '&:hover fieldset': { borderColor: '#e0c4c4' },
                          '&.Mui-focused fieldset': { borderColor: '#e53935' },
                        },
                        '& .MuiOutlinedInput-input': { fontWeight: 400, lineHeight: 1.6 },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box
                sx={{
                  ...sectionCardSx,
                  mb: 2.5,
                }}
              >
                <Typography variant="h6" sx={sectionTitleSx}>Contact & Security</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField label="Email Address" name="email" value={form.email} onChange={handleInput} required fullWidth />
                    <FormControlLabel control={<Checkbox checked={form.hideEmail} onChange={handleInput} name="hideEmail" />} label="Hide Email Address" sx={{ mt: 0.5 }} />
                  </Grid>

                  <Grid item xs={12} sm={4} md={3}>
                    <FormControl fullWidth required>
                      <InputLabel>Phone Code</InputLabel>
                      <Select name="phoneCode" value={form.phoneCode} onChange={handleInput} label="Phone Code" displayEmpty>
                        <MenuItem value="" disabled>
                          <span style={{ color: '#aaa' }}>Phone Code</span>
                        </MenuItem>
                        {phoneCodes.map((code) => (
                          <MenuItem key={code} value={code}>{code}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={8} md={9}>
                    <TextField label="Phone Number" name="phone" value={form.phone} onChange={handleInput} required fullWidth />
                    <FormControlLabel control={<Checkbox checked={form.hidePhone} onChange={handleInput} name="hidePhone" />} label="Hide Phone Number" sx={{ mt: 0.5 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField label="Password" name="password" value={form.password} onChange={handleInput} type="password" required fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={handleInput} type="password" required fullWidth />
                  </Grid>

                  <Grid item xs={12} sm={4} md={3}>
                    <FormControl fullWidth required>
                      <InputLabel>Currency</InputLabel>
                      <Select name="currency" value={form.currency} onChange={handleInput} label="Currency" displayEmpty>
                        <MenuItem value="" disabled>
                          <span style={{ color: '#aaa' }}>Currency</span>
                        </MenuItem>
                        {currencies.map((cur) => (
                          <MenuItem key={cur} value={cur}>{cur}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={8} md={9}>
                    <TextField label="Minimum Charge Per Session" name="minCharge" value={form.minCharge} onChange={handleInput} required fullWidth />
                  </Grid>

                </Grid>
              </Box>

              <Box
                sx={{
                  ...sectionCardSx,
                  mb: 2.5,
                }}
              >
                <Typography variant="h6" sx={sectionTitleSx}>Specialties</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.1 }}>
                  {(showAllSpecialties ? specialtiesList : specialtiesList.slice(0, 10)).map((spec) => (
                    <Chip
                      key={spec}
                      label={spec}
                      color={form.specialties.includes(spec) ? 'primary' : 'default'}
                      onClick={() => handleSpecialtyToggle(spec)}
                      sx={{
                        fontWeight: 500,
                        fontSize: 14,
                        borderRadius: 2,
                        border: form.specialties.includes(spec) ? '2px solid #e53935' : '1px solid #e4c5c5',
                        background: form.specialties.includes(spec) ? '#ffebee' : '#fff',
                        color: '#d32f2f',
                        px: 1.2,
                      }}
                    />
                  ))}
                  {!showAllSpecialties && (
                    <Button onClick={() => setShowAllSpecialties(true)} sx={{ color: '#e53935', fontWeight: 'bold', ml: 0.5, textTransform: 'none' }}>
                      Show more
                    </Button>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  ...sectionCardSx,
                  mb: 2.5,
                }}
              >
                <Typography variant="h6" sx={sectionTitleSx}>Location</Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
                  }}
                >
                  <Box sx={{ gridColumn: { xs: 'auto', md: 'span 3' } }}>
                    <FormControl fullWidth required>
                      <InputLabel>Country</InputLabel>
                      <Select name="country" value={form.country} onChange={handleInput} label="Country">
                        {countries.map((c) => (
                          <MenuItem key={c} value={c}>{c}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ gridColumn: { xs: 'auto', md: 'span 1' } }}>
                    <TextField label="Area" name="area" value={form.area} onChange={handleInput} required fullWidth />
                  </Box>
                  <Box sx={{ gridColumn: { xs: 'auto', md: 'span 2' } }}>
                    <TextField label="City" name="city" value={form.city} onChange={handleInput} required fullWidth />
                  </Box>
                  <Box sx={{ gridColumn: { xs: 'auto', md: 'span 2' } }}>
                    <TextField label="Street" name="street" value={form.street} onChange={handleInput} fullWidth />
                  </Box>
                  <Box sx={{ gridColumn: { xs: 'auto', md: 'span 2' } }}>
                    <TextField label="Building" name="building" value={form.building} onChange={handleInput} fullWidth />
                  </Box>
                  <Box sx={{ gridColumn: { xs: 'auto', md: 'span 2' } }}>
                    <TextField label="Floor" name="floor" value={form.floor} onChange={handleInput} fullWidth />
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  ...sectionCardSx,
                  mb: 2.5,
                }}
              >
                <Typography variant="h6" sx={sectionTitleSx}>Social Media (optional)</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Facebook"
                      name="facebook"
                      value={form.facebook}
                      onChange={handleInput}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FacebookOutlinedIcon sx={{ color: 'rgba(229, 57, 53, 0.7)' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Instagram"
                      name="instagram"
                      value={form.instagram}
                      onChange={handleInput}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <InstagramIcon sx={{ color: 'rgba(229, 57, 53, 0.7)' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box
                sx={{
                  ...sectionCardSx,
                  mb: 2.5,
                }}
              >
                <Typography variant="h6" sx={sectionTitleSx}>Certificates & Awards</Typography>
                <Box
                  sx={uploadDropzoneSx}
                  onClick={() => document.getElementById('certificates-input').click()}
                >
                  <CloudUploadIcon sx={{ fontSize: 46, color: '#e53935', mb: 0.6 }} />
                  <Typography variant="body2">Click or drop files to upload Certificates & Awards</Typography>
                  <input
                    id="certificates-input"
                    type="file"
                    accept="application/pdf,image/*"
                    multiple
                    hidden
                    onChange={handleCertificatesChange}
                  />
                  {certificates.length > 0 && (
                    <Box sx={{ mt: 1.4, display: 'grid', gap: 0.4 }}>
                      {certificates.map((file, idx) => (
                        <Typography key={idx} variant="caption">{file.name}</Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>

              <Box
                sx={{
                  ...sectionCardSx,
                }}
              >
                <FormControlLabel
                  control={<Checkbox checked={form.agreePrivacy} onChange={handleInput} name="agreePrivacy" required />}
                  label={<span>I agree to the <a href="#" style={{ color: '#e53935' }}>Privacy Policy</a></span>}
                  sx={{ display: 'block', mb: 0.8 }}
                />
                <FormControlLabel
                  control={<Checkbox checked={form.agreeTerms} onChange={handleInput} name="agreeTerms" required />}
                  label={<span>I agree to the <a href="#" style={{ color: '#e53935' }}>Terms & Conditions</a></span>}
                  sx={{ display: 'block' }}
                />

                <Box sx={{ mt: 3, mb: 1, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{
                      width: '100%',
                      maxWidth: 420,
                      background: 'linear-gradient(90deg, #eb3b37 0%, #e53935 55%, #dc2f2f 100%)',
                      fontWeight: 'bold',
                      fontSize: 18,
                      minHeight: 58,
                      borderRadius: 2.4,
                      boxShadow: '0 12px 26px rgba(229, 57, 53, 0.28)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #df332f 0%, #d53030 60%, #c62828 100%)',
                        boxShadow: '0 14px 28px rgba(211, 47, 47, 0.34)',
                      },
                    }}
                  >
                    Register
                  </Button>
                </Box>

                <Typography align="center" sx={{ mt: 2 }}>
                  Already a member?{' '}
                  <Button variant="text" sx={{ color: '#e53935', fontWeight: 'bold', textTransform: 'none' }} onClick={() => setShowSignup(false)}>
                    Sign in
                  </Button>
                </Typography>
              </Box>
            </form>
          </React.Fragment>
        )}
        </Paper>
      </Container>
    </Box>
  );
};

export default TrainerPortalRegister;
