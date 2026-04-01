import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppBar, Toolbar, Box, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAuth } from './AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleChat = () => { setAnchorEl(null); navigate('/chats'); };
  const handleLogout = () => { logout(); setAnchorEl(null); navigate('/'); };
  const handleNavLogin = () => navigate('/login');
  const handleNavRegister = () => navigate('/register');

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
              <IconButton onClick={handleMenu} color="inherit" sx={{ ml: 1 }}>
                <AccountCircle sx={{ color: '#fff' }} />
                <Typography sx={{ ml: 1, color: '#fff', fontWeight: 'bold' }}>
                  {user.firstName || (user.name ? user.name.split(' ')[0] : '') || user.email || 'User'}
                </Typography>
              </IconButton>
              <Menu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MenuItem onClick={handleChat}>Chat</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
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
