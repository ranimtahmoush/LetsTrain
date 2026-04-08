import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LogoutIcon from '@mui/icons-material/Logout';
import MessageIcon from '@mui/icons-material/Message';
import Avatar from '@mui/material/Avatar';

const ClientDashboard = () => {
  const [goals, setGoals] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatMessages, setChatMessages] = useState({});
  const [workoutCount, setWorkoutCount] = useState(0);
  const [metricsCount, setMetricsCount] = useState(0);
  const [photosCount, setPhotosCount] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', weightLoss: '', duration: '', sessionsPerWeek: '' });
  
  const suggestedGoals = [
    'Weight Loss',
    'Strength Gaining',
    'Better Shape',
    'Muscle Building',
    'Endurance',
    'Flexibility',
    'Core Strength',
    'Cardio Fitness'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };

        const [goalsRes, bookingsRes, workoutRes, metricsRes, photosRes, userRes, chatsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/clients/goals', { headers }),
          axios.get('http://localhost:5000/api/bookings', { headers }),
          axios.get('http://localhost:5000/api/progress/workout-logs', { headers }),
          axios.get('http://localhost:5000/api/progress/fitness-metrics', { headers }),
          axios.get('http://localhost:5000/api/progress/progress-photos', { headers }),
          axios.get('http://localhost:5000/api/auth/me', { headers }),
          axios.get('http://localhost:5000/api/chats', { headers })
            .catch(err => ({ data: [] }))
        ]);

        setGoals(goalsRes.data);
        setBookings(bookingsRes.data);
        setWorkoutCount(workoutRes.data.length);
        setMetricsCount(metricsRes.data.length);
        setPhotosCount(photosRes.data.length);
        setUser(userRes.data);
        setChats(chatsRes.data || []);

        // Fetch last message for each chat
        if (chatsRes.data && chatsRes.data.length > 0) {
          const messagesMap = {};
          for (const chat of chatsRes.data) {
            try {
              const messagesRes = await axios.get(
                `http://localhost:5000/api/chats/${chat._id}/messages`,
                { headers }
              );
              const messages = messagesRes.data;
              if (messages.length > 0) {
                messagesMap[chat._id] = messages[messages.length - 1];
              }
            } catch (err) {
              console.log('Could not fetch messages for chat', chat._id);
            }
          }
          setChatMessages(messagesMap);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const selectGoalSuggestion = (goal) => {
    setForm({ ...form, title: goal });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/clients/goals', form, {
        headers: { 'x-auth-token': token }
      });
      // Refresh goals
      const res = await axios.get('http://localhost:5000/api/clients/goals', {
        headers: { 'x-auth-token': token }
      });
      setGoals(res.data);
      setForm({ title: '', description: '', weightLoss: '', duration: '', sessionsPerWeek: '' });
    } catch (err) {
      console.error('Error posting goal:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/trainers');
  };

  const formatDate = (date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diff = now - msgDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return msgDate.toLocaleDateString();
  };

  const openChat = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Client Dashboard</Typography>
          <Button color="inherit" onClick={() => navigate('/classes-list')}>Group Classes</Button>
          <Button color="inherit" onClick={() => navigate('/trainers')}>Find Trainers</Button>
          <Button color="inherit" onClick={() => navigate('/fitness-tracker')} startIcon={<FitnessCenterIcon />}>
            Fitness Tracker
          </Button>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Workouts</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{workoutCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Metrics Logged</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{metricsCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Active Goals</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{goals.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Trainer Sessions</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{bookings.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/fitness-tracker')}
          startIcon={<FitnessCenterIcon />}
          sx={{ mb: 3 }}
          size="large"
        >
          Go to Fitness Tracker
        </Button>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Set New Goal</Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>Suggested Goals:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {suggestedGoals.map(goal => (
                  <Chip
                    key={goal}
                    label={goal}
                    onClick={() => selectGoalSuggestion(goal)}
                    variant={form.title === goal ? 'filled' : 'outlined'}
                    color={form.title === goal ? 'primary' : 'default'}
                  />
                ))}
              </Box>
              <form onSubmit={onSubmit}>
                <TextField
                  fullWidth
                  name="title"
                  placeholder="Goal Title (or select above)"
                  onChange={onChange}
                  value={form.title}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  name="description"
                  placeholder="Description"
                  onChange={onChange}
                  value={form.description}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  name="weightLoss"
                  type="number"
                  placeholder="Weight Loss Goal (kg)"
                  onChange={onChange}
                  value={form.weightLoss}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  name="duration"
                  type="number"
                  placeholder="Duration (weeks)"
                  onChange={onChange}
                  value={form.duration}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  name="sessionsPerWeek"
                  type="number"
                  placeholder="Sessions per week"
                  onChange={onChange}
                  value={form.sessionsPerWeek}
                />
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                  Set Goal
                </Button>
              </form>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Your Goals</Typography>
              <List>
                {goals.length > 0 ? (
                  goals.map(goal => (
                    <ListItem key={goal._id}>
                      <ListItemText
                        primary={goal.title}
                        secondary={`${goal.description} - Duration: ${goal.duration} weeks`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography color="textSecondary">No goals set yet</Typography>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Your Bookings</Typography>
          <List>
            {bookings.length > 0 ? (
              bookings.map(booking => (
                <ListItem key={booking._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                  <ListItemText
                    primary={`Trainer: ${booking.trainer?.user?.name || 'Unknown'}`}
                    secondary={`Status: ${booking.status}`}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    component={Link}
                    to={`/chat/${booking._id}`}
                  >
                    Chat
                  </Button>
                </ListItem>
              ))
            ) : (
              <Typography color="textSecondary">No bookings yet</Typography>
            )}
          </List>
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <MessageIcon /> Messages from Trainers
          </Typography>
          <List>
            {chats.length > 0 ? (
              chats.map(chat => (
                <ListItem
                  key={chat._id}
                  onClick={() => navigate('/chats')}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    px: 2,
                    borderBottom: '1px solid #eee',
                    '&:last-child': { borderBottom: 'none' },
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f5f5f5', borderLeft: '4px solid #1976d2' },
                    transition: 'all 0.2s'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {chat.trainer?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {chat.trainer?.name || 'Unknown Trainer'}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {chatMessages[chat._id] 
                          ? `${chatMessages[chat._id].sender?.name}: ${chatMessages[chat._id].message?.substring(0, 40)}${chatMessages[chat._id].message?.length > 40 ? '...' : ''}`
                          : 'No messages yet'
                        }
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={formatDate(chatMessages[chat._id]?.createdAt || chat.createdAt)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </ListItem>
              ))
            ) : (
              <Typography color="textSecondary" sx={{ py: 2 }}>
                No messages yet. Message trainers when you're interested in booking sessions.
              </Typography>
            )}
          </List>
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>My Profile</Typography>
          {user && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1"><strong>Journey Started:</strong> {Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} days ago</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1"><strong>Coaches Worked With:</strong> {new Set(bookings.map(b => b.trainer?._id)).size}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1"><strong>Sessions Booked:</strong> {bookings.length}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1"><strong>Total Workouts Logged:</strong> {workoutCount}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1"><strong>Progress Photos:</strong> {photosCount}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1"><strong>Fitness Metrics Logged:</strong> {metricsCount}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Progress Achieved:</strong> {workoutCount > 0 ? `${workoutCount} workouts completed` : 'Start your fitness journey!'}</Typography>
              </Grid>
            </Grid>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ClientDashboard;