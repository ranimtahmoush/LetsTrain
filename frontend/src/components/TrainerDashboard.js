
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem, ListItemIcon, ListItemText, Divider, CssBaseline, Container, Grid, Card, CardContent, Avatar, Button, Chip, Badge, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, Dialog, DialogTitle, DialogContent, TextField, Autocomplete, Select, MenuItem, FormControl, InputLabel, Alert, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MessageIcon from '@mui/icons-material/Message';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReviewsIcon from '@mui/icons-material/Reviews';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const fieldSx = { 
  '& .MuiOutlinedInput-root': { 
    height: 56,
    display: 'flex',
    alignItems: 'center'
  },
  '& .MuiInputBase-input': { 
    height: '100%',
    padding: '0 14px !important',
    boxSizing: 'border-box' 
  }
};

const titleSuggestions = [
  'Yoga Morning Class',
  'Pilates Evening Session',
  'HIIT Cardio Blast',
  'Strength Training Boot Camp',
  'Dance Fitness Party',
  'Dabke Class',
  'Beginner Yoga Flow',
  'Advanced Boxing Training',
  'Core Strengthening Class',
  'Cardio Dance Mix',
  'Flexibility & Stretching',
  'High-Intensity Interval Training',
  'Meditation & Relaxation',
  'Full Body Workout'
];

const categoryOptions = [
  'Boxing',
  'Yoga',
  'Pilates',
  'HIIT',
  'Strength Training',
  'Cardio',
  'Dancing',
  'Dabke',
  'Meditation',
  'Stretching',
  'CrossFit',
  'Other'
];

// Placeholder for now, will connect to backend in next steps
const dummyStats = [
  { label: 'Sessions Completed', value: 0, icon: <EventIcon />, color: '#e53935' },
  { label: 'Total Bookings', value: 0, icon: <DashboardIcon />, color: '#3949ab' },
  { label: 'Unique Clients', value: 0, icon: <GroupIcon />, color: '#43a047' },
  { label: 'Rating', value: '0', icon: <StarIcon />, color: '#FFD700' },
];

const drawerWidth = 220;

const TrainerDashboard = () => {
  // State for sidebar toggle (mobile)
  const [mobileOpen, setMobileOpen] = React.useState(false);
  // Modal state for messages
  const [messagesOpen, setMessagesOpen] = React.useState(false);
  // Modal state for earnings report
  const [earningsOpen, setEarningsOpen] = React.useState(false);
  // Modal state for create class
  const [createClassOpen, setCreateClassOpen] = React.useState(false);
  // Form state for create class
  const [classForm, setClassForm] = React.useState({
    title: '',
    description: '',
    category: '',
    maxParticipants: '',
    price: '',
    date: '',
    duration: '',
    location: '',
    level: '',
    equipment: '',
  });

  // State for bookings
  const [bookings, setBookings] = React.useState([]);
  const [loadingBookings, setLoadingBookings] = React.useState(true);
  const [bookingsError, setBookingsError] = React.useState('');

  // Fetch bookings for trainer
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/bookings', {
          headers: { 'x-auth-token': token }
        });
        // Filter to only show bookings where current user is trainer
        const trainerBookings = response.data.filter(booking => booking.trainerUser);
        setBookings(trainerBookings.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setBookingsError('');
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setBookingsError('Failed to load bookings');
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, []);

  // Dummy messages array (replace with backend data)
  const messages = [];
  // Dummy earnings data (replace with backend data)
  // Each entry: { date: '2026-03-10', amount: 50 }
  const earnings = [];

  // Placeholder: Replace with real data fetching in next steps
  const trainer = {
    name: 'Ramin Tahmoush',
    role: 'Professional Trainer',
    specialties: ['CrossFit', 'Boxing'],
    experience: 0,
    pricePerSession: 20,
    location: 'Aley',
    phone: '+971 71929115',
    avatar: '',
    rating: 0,
  };

  const navigate = useNavigate();

  // Sidebar navigation items
  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon /> },
    { label: 'Messages', icon: <MessageIcon />, onClick: () => navigate('/chats') },
    { label: 'Bookings', icon: <EventIcon /> },
    { label: 'Classes', icon: <ScheduleIcon /> },
    { label: 'Earnings', icon: <MonetizationOnIcon />, onClick: () => setEarningsOpen(true) },
    { label: 'Reviews', icon: <ReviewsIcon /> },
    { label: 'Logout', icon: <LogoutIcon />, onClick: () => {
      localStorage.removeItem('token');
      navigate('/');
    } },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle booking confirmation by trainer
  const handleConfirmBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}`,
        { status: 'confirmed' },
        { headers: { 'x-auth-token': token } }
      );
      // Update local state
      setBookings(bookings.map(b => 
        b._id === bookingId ? { ...b, status: 'confirmed' } : b
      ));
    } catch (err) {
      console.error('Error confirming booking:', err);
      setBookingsError('Failed to confirm booking');
    }
  };

  // Handle booking rejection by trainer
  const handleRejectBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}`,
        { status: 'rejected' },
        { headers: { 'x-auth-token': token } }
      );
      // Update local state
      setBookings(bookings.map(b => 
        b._id === bookingId ? { ...b, status: 'rejected' } : b
      ));
    } catch (err) {
      console.error('Error rejecting booking:', err);
      setBookingsError('Failed to reject booking');
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return '#43a047';
      case 'pending': return '#fb8c00';
      case 'rejected': return '#e53935';
      case 'completed': return '#1565c0';
      default: return '#888';
    }
  };

  // Get status badge label
  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Layout
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', bgcolor: '#f7f8fa', minHeight: '100vh' }}>
        <CssBaseline />
        {/* Sidebar for desktop */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#fff', borderRight: '1px solid #eee' },
            display: { xs: 'none', md: 'block' },
          }}
        open
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#e53935' }}>LetsTrain</Typography>
        </Toolbar>
        <Divider />
        <List>
          {navItems.map((item, idx) => (
            <ListItem
              button
              key={item.label}
              sx={{ py: 1.5, px: 3, '&:hover': { bgcolor: '#ffeaea' } }}
              onClick={item.onClick}
            >
              <ListItemIcon sx={{ color: idx === 0 ? '#e53935' : '#888' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: idx === 0 ? 700 : 500, color: idx === 0 ? '#e53935' : '#222' }} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Top AppBar for mobile */}
      <AppBar position="fixed" sx={{ display: { xs: 'block', md: 'none' }, bgcolor: '#e53935', color: '#fff', zIndex: 1201 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>LetsTrain</Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#fff', borderRight: '1px solid #eee' },
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#e53935' }}>LetsTrain</Typography>
        </Toolbar>
        <Divider />
        <List>
          {navItems.map((item, idx) => (
            <ListItem
              button
              key={item.label}
              sx={{ py: 1.5, px: 3, '&:hover': { bgcolor: '#ffeaea' } }}
              onClick={item.onClick}
            >
              <ListItemIcon sx={{ color: idx === 0 ? '#e53935' : '#888' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: idx === 0 ? 700 : 500, color: idx === 0 ? '#e53935' : '#222' }} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Messages Modal */}
      <Dialog open={messagesOpen} onClose={() => setMessagesOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#e53935', borderBottom: '1px solid #eee' }}>Messages from Clients</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {messages.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: '#888' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>📭 No messages yet</Typography>
              <Typography variant="body2">When clients message you, they'll appear here. Share your profile to get started!</Typography>
            </Box>
          ) : (
            <List>
              {messages.map((msg, idx) => (
                <ListItem key={idx} divider>
                  <Avatar sx={{ mr: 2 }}>{msg.clientName?.charAt(0) || '?'}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{msg.clientName}</Typography>
                    <Typography variant="body2" sx={{ color: '#888' }}>{msg.preview}</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#aaa', minWidth: 80, textAlign: 'right' }}>{msg.time}</Typography>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, ml: { md: `${drawerWidth}px` }, mt: { xs: 8, md: 0 } }}>
        {/* Quick Actions Bar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: '#e53935', color: '#fff', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#b71c1c' } }}
            onClick={() => setCreateClassOpen(true)}
          >
            Create New Class
          </Button>
          <Button variant="outlined" startIcon={<ScheduleIcon />} sx={{ color: '#e53935', borderColor: '#e53935', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#ffeaea' } }}>View Schedule</Button>
          <Button variant="outlined" startIcon={<MonetizationOnIcon />} sx={{ color: '#e53935', borderColor: '#e53935', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#ffeaea' } }} onClick={() => setEarningsOpen(true)}>Earnings Report</Button>
        </Box>
            {/* Create Class Modal */}
            <Dialog open={createClassOpen} onClose={() => setCreateClassOpen(false)} maxWidth="md" fullWidth>
              <DialogTitle sx={{ fontWeight: 700, color: '#e53935', borderBottom: '1px solid #eee' }}>Create New Class</DialogTitle>
              <DialogContent>
                <Box component="form"
                  sx={{ mt: 2 }}
                  onSubmit={e => {
                    e.preventDefault();
                    setCreateClassOpen(false);
                    setClassForm({ title: '', description: '', category: '', maxParticipants: '', price: '', date: '', duration: '', location: '', level: '', equipment: '' });
                  }}
                >
                  <input style={{ display: 'none' }} />
                  <Grid container spacing={2.5}>
                    {/* Row 1: Title and Category */}
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        freeSolo
                        options={titleSuggestions}
                        value={classForm.title}
                        onChange={(event, newValue) => {
                          setClassForm(f => ({ ...f, title: newValue || '' }));
                        }}
                        inputValue={classForm.title}
                        onInputChange={(event, newInputValue) => {
                          setClassForm(f => ({ ...f, title: newInputValue }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Title"
                            required
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': { 
                                height: 56,
                                display: 'flex',
                                alignItems: 'center'
                              },
                              '& .MuiInputBase-input': { 
                                height: '100% !important',
                                padding: '0 14px !important',
                                boxSizing: 'border-box' 
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required sx={{ minHeight: 56 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={classForm.category}
                          onChange={e => setClassForm(f => ({ ...f, category: e.target.value }))}
                          label="Category"
                          sx={{ 
                            height: 56,
                            '& .MuiOutlinedInput-notchedOutline': { top: 0 },
                            '& .MuiInputBase-input': { padding: '0 14px' }
                          }}
                        >
                          {categoryOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Row 2: Date and Location */}
                    <Grid item xs={12} sm={6}>
                      <DatePicker 
                        label="Date" 
                        value={classForm.date ? dayjs(classForm.date) : null}
                        onChange={(newDate) => {
                          if (newDate) {
                            setClassForm(f => ({ ...f, date: newDate.format('YYYY-MM-DD') }));
                          }
                        }}
                        minDate={dayjs()}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            sx: fieldSx
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Location" 
                        value={classForm.location} 
                        onChange={e => setClassForm(f => ({ ...f, location: e.target.value }))} 
                        required 
                        fullWidth 
                        sx={fieldSx}
                      />
                    </Grid>

                    {/* Row 3: Max Participants and Price */}
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Max Participants" 
                        type="number" 
                        value={classForm.maxParticipants} 
                        onChange={e => setClassForm(f => ({ ...f, maxParticipants: e.target.value }))} 
                        required 
                        fullWidth 
                        sx={fieldSx}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Price ($)" 
                        type="number" 
                        value={classForm.price} 
                        onChange={e => setClassForm(f => ({ ...f, price: e.target.value }))} 
                        required 
                        fullWidth 
                        sx={fieldSx}
                      />
                    </Grid>

                    {/* Row 4: Duration and Level */}
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Duration (minutes)" 
                        type="number" 
                        value={classForm.duration} 
                        onChange={e => setClassForm(f => ({ ...f, duration: e.target.value }))} 
                        required 
                        fullWidth 
                        sx={fieldSx}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        label="Level" 
                        value={classForm.level} 
                        onChange={e => setClassForm(f => ({ ...f, level: e.target.value }))} 
                        fullWidth 
                        sx={fieldSx}
                      />
                    </Grid>

                    {/* Row 5: Equipment */}
                    <Grid item xs={12}>
                      <TextField 
                        label="Equipment" 
                        value={classForm.equipment} 
                        onChange={e => setClassForm(f => ({ ...f, equipment: e.target.value }))} 
                        fullWidth 
                        sx={fieldSx}
                      />
                    </Grid>

                    {/* Row 6: Description */}
                    <Grid item xs={12}>
                      <TextField 
                        label="Description" 
                        value={classForm.description} 
                        onChange={e => setClassForm(f => ({ ...f, description: e.target.value }))} 
                        required 
                        fullWidth 
                        multiline 
                        minRows={4}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                    <Button onClick={() => setCreateClassOpen(false)} sx={{ color: '#888', fontWeight: 500 }}>Cancel</Button>
                    <Button type="submit" variant="contained" sx={{ bgcolor: '#e53935', color: '#fff', fontWeight: 700, borderRadius: 2 }}>Create</Button>
                  </Box>
                </Box>
              </DialogContent>
            </Dialog>
      {/* Earnings Report Modal */}
      <Dialog open={earningsOpen} onClose={() => setEarningsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#43a047', borderBottom: '1px solid #eee' }}>Earnings Report</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {earnings.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: '#888' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>No earnings yet</Typography>
              <Typography variant="body2">You haven't earned any money yet. When you complete paid sessions, your earnings will appear here.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 0 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Earnings</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {earnings.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell align="right">
                        <Typography sx={{ color: '#43a047', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 18, color: '#43a047' }} />
                          ${row.amount}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {dummyStats.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 2px 12px rgba(229,57,53,0.07)', bgcolor: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minHeight: 180, justifyContent: 'center' }}>
                <Box sx={{ bgcolor: stat.color, color: stat.label === 'Rating' ? '#222' : '#fff', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  {stat.icon}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, fontSize: 32 }}>{stat.value}</Typography>
                  {stat.label === 'Rating' && <StarIcon sx={{ color: '#FFD700', fontSize: 28 }} />}
                </Box>
                <Typography variant="subtitle1" sx={{ color: '#888', fontWeight: 500, textAlign: 'center' }}>{stat.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Profile Card */}
        <Card sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(229,57,53,0.07)', bgcolor: '#fff', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 3 }}>
          <Avatar src={trainer.avatar} sx={{ width: 100, height: 100, mr: { md: 3 }, mb: { xs: 2, md: 0 }, border: '4px solid #e53935' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{trainer.name}</Typography>
            <Typography variant="subtitle1" sx={{ color: '#e53935', fontWeight: 500, mb: 1 }}>{trainer.role}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {trainer.specialties.map((s, i) => <Chip key={i} label={s} size="small" sx={{ bgcolor: '#ffeaea', color: '#e53935', fontWeight: 500 }} />)}
            </Box>
            <Grid container spacing={2} sx={{ mb: 1 }}>
              <Grid item xs={12} sm={6} md={3}><Typography variant="body2">⏱️ Experience: {trainer.experience} years</Typography></Grid>
              <Grid item xs={12} sm={6} md={3}><Typography variant="body2">💰 Price: ${trainer.pricePerSession}/session</Typography></Grid>
              <Grid item xs={12} sm={6} md={3}><Typography variant="body2">📍 Location: {trainer.location}</Typography></Grid>
              <Grid item xs={12} sm={6} md={3}><Typography variant="body2">📞 Phone: {trainer.phone}</Typography></Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button variant="outlined" sx={{ color: '#e53935', borderColor: '#e53935', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#ffeaea' } }}>Edit Profile</Button>
              <Button variant="contained" sx={{ bgcolor: '#e53935', color: '#fff', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#b71c1c' } }}>View Public Profile</Button>
            </Box>
          </Box>
        </Card>

        {/* Placeholder for next sections: Messages, Bookings, etc. */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Messages Inbox (Coming Next)</Typography>
          <Paper sx={{ p: 4, textAlign: 'center', color: '#888', bgcolor: '#fafbfc', borderRadius: 3, boxShadow: 'none' }}>
            <Typography variant="body1">This section will show your messages from clients.</Typography>
          </Paper>
        </Box>

        {/* Client Bookings Section */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Client Bookings</Typography>
          {bookingsError && <Alert severity="error" sx={{ mb: 2 }}>{bookingsError}</Alert>}
          
          {loadingBookings ? (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#fafbfc', borderRadius: 3, boxShadow: 'none' }}>
              <CircularProgress />
            </Paper>
          ) : bookings.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', color: '#888', bgcolor: '#fafbfc', borderRadius: 3, boxShadow: 'none' }}>
              <Typography variant="body1">No bookings yet. Clients will see your availability here.</Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none', bgcolor: '#fff', border: '1px solid #eee' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#fafbfc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#333' }}>Client Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#333' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#333' }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#333' }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#333' }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#333' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#333' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                      <TableCell>{booking.client?.name || 'Unknown'}</TableCell>
                      <TableCell>{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                      <TableCell>{booking.time}</TableCell>
                      <TableCell>{booking.duration} min</TableCell>
                      <TableCell>${booking.price?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(booking.status)} 
                          sx={{ 
                            background: getStatusColor(booking.status), 
                            color: '#fff',
                            fontWeight: 600
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        {booking.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              variant="contained" 
                              size="small"
                              sx={{ bgcolor: '#43a047', color: '#fff', fontWeight: 600, borderRadius: 1, '&:hover': { bgcolor: '#2e7d32' } }}
                              onClick={() => handleConfirmBooking(booking._id)}
                            >
                              Accept
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small"
                              sx={{ borderColor: '#e53935', color: '#e53935', fontWeight: 600, borderRadius: 1, '&:hover': { bgcolor: '#ffeaea' } }}
                              onClick={() => handleRejectBooking(booking._id)}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                        {booking.status === 'confirmed' && (
                          <Chip label="✓ Confirmed" sx={{ background: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }} />
                        )}
                        {booking.status === 'rejected' && (
                          <Chip label="✗ Rejected" sx={{ background: '#ffebee', color: '#c62828', fontWeight: 600 }} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default TrainerDashboard;

