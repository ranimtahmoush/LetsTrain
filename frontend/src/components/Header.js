import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Box, Typography, Button, IconButton, Menu, MenuItem, Divider, Paper } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MessageIcon from '@mui/icons-material/Message';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from './AuthContext';
import { useState } from 'react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleChat = () => { setAnchorEl(null); navigate('/messages', { state: { from: location.pathname } }); };
  const handleLogout = () => { logout(); setAnchorEl(null); navigate('/'); };
  const handleNavLogin = () => navigate('/login');
  const handleNavRegister = () => navigate('/register');
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#e53935', color: '#fff' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FitnessCenterIcon sx={{ color: '#fff', fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff' }}>
            LetsTrain
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button onClick={() => navigate('/')} sx={{ color: '#fff', fontWeight: 'bold', '&:hover': { backgroundColor: '#b71c1c', color: '#fff' } }}>HOME</Button>
          <Button component={Link} to="/classes" sx={{ color: '#fff', fontWeight: 'bold', '&:hover': { backgroundColor: '#b71c1c', color: '#fff' } }}>EXPLORE CLASSES</Button>
          <Button component={Link} to="/trainers" sx={{ color: '#fff', fontWeight: 'bold', '&:hover': { backgroundColor: '#b71c1c', color: '#fff' } }}>FIND TRAINERS</Button>
          <Button component={Link} to="/trainer-portal-register" sx={{ color: '#e53935', fontWeight: 'bold', border: '2px solid #fff', borderRadius: 2, ml: 1, px: 2, backgroundColor: '#fff', '&:hover': { backgroundColor: '#ffebee', color: '#b71c1c', borderColor: '#b71c1c' } }}>FOR TRAINERS</Button>
          {user ? (
            <>
              <IconButton onClick={handleMenu} color="inherit" sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1, padding: '6px 12px', borderRadius: 2, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                <AccountCircle sx={{ color: '#fff', fontSize: 28 }} />
                <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
                  {user.name ? user.name.split(' ')[0] : 'User'}
                </Typography>
              </IconButton>
              <Menu 
                anchorEl={anchorEl} 
                open={open} 
                onClose={handleClose} 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(229,57,53,0.15)',
                    minWidth: 220,
                    mt: 1,
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AccountCircle sx={{ color: '#e53935', fontSize: 32 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: '#333', fontSize: 16 }}>{user.name || 'User'}</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <MenuItem 
                  onClick={handleChat}
                  sx={{ 
                    py: 1.2,
                    color: '#333',
                    '&:hover': { backgroundColor: '#ffeaea', color: '#e53935' },
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'center'
                  }}
                >
                  <MessageIcon sx={{ fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 500 }}>Messages</Typography>
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ 
                    py: 1.2,
                    color: '#d32f2f',
                    '&:hover': { backgroundColor: '#ffebee', color: '#b71c1c' },
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'center',
                    borderTop: '1px solid #eee'
                  }}
                >
                  <LogoutIcon sx={{ fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 500 }}>Logout</Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={handleNavLogin} sx={{ color: '#fff', '&:hover': { backgroundColor: '#b71c1c', color: '#fff' } }}>Login</Button>
              <Button onClick={handleNavRegister} variant="contained" sx={{ backgroundColor: '#fff', color: '#e53935', '&:hover': { backgroundColor: '#ffebee', color: '#b71c1c' } }}>Sign Up</Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
