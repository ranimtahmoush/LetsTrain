import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
  FormControlLabel,
  Checkbox,
  Divider,
  Stack,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from './AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      login(res.data.token);
      // Check for returnUrl in query params
      const params = new URLSearchParams(location.search);
      const returnUrl = params.get('returnUrl');
      if (returnUrl) {
        navigate(returnUrl, { replace: true });
      } else {
        navigate('/');
      }
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#e53935', color: '#fff' }}>
        <Toolbar>
          <FitnessCenterIcon sx={{ mr: 2, color: '#fff' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#fff', fontWeight: 'bold' }}>
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
          background: 'linear-gradient(150deg, #fff5f5 0%, #ffffff 45%, #ffe9e9 100%)',
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
              Sign In
            </Typography>
            <Typography align="center" sx={{ mt: 1.25, color: '#7a4a4a', fontSize: '0.96rem' }}>
              Welcome back! Continue your fitness journey with LetsTrain.
            </Typography>

            <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                onChange={onChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: '#d32f2f' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                onChange={onChange}
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

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                <FormControlLabel
                  control={<Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} sx={{ color: '#e53935', '&.Mui-checked': { color: '#d32f2f' } }} />}
                  label="Remember me"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.92rem' } }}
                />
                <Button
                  type="button"
                  component={Link}
                  to="/forgot-password"
                  sx={{
                    color: '#d32f2f',
                    fontWeight: 600,
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 0,
                  }}
                >
                  Forgot password?
                </Button>
              </Stack>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
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
                Sign In
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

              <Button component={Link} to="/register" fullWidth sx={{ color: '#e53935', fontWeight: 'bold', textTransform: 'none' }}>
                Don't have an account? Sign Up
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default Login;