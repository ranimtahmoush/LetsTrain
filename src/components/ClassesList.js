import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AppBar,
  Toolbar
} from '@mui/material';
import { AccessTime, LocationOn, Person, AttachMoney } from '@mui/icons-material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

const ClassesList = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/classes');
      setClasses(res.data);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const handleJoinClass = async (classId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/classes/${classId}/join`, {}, {
        headers: { 'x-auth-token': token }
      });
      await fetchClasses(); // Refresh the list
      setOpenDialog(false);
      alert('Successfully joined the class!');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error joining class');
    }
    setLoading(false);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Yoga': 'success',
      'Pilates': 'primary',
      'HIIT': 'error',
      'Strength Training': 'warning',
      'Cardio': 'secondary',
      'Dance': 'info',
      'Meditation': 'success',
      'Other': 'default'
    };
    return colors[category] || 'default';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/trainers');
  };

  return (
    <Box sx={{ mb: 4 }}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Group Classes</Typography>
          <Button color="inherit" onClick={() => navigate('/client-dashboard')}>
            Back to Dashboard
          </Button>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
          Available Group Classes
        </Typography>

        <Grid container spacing={3}>
          {classes.map((classItem) => (
            <Grid item xs={12} sm={6} md={4} key={classItem._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {classItem.trainer?.name?.charAt(0) || 'T'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {classItem.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        by {classItem.trainer?.name || 'Trainer'}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={classItem.category}
                    color={getCategoryColor(classItem.category)}
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <AccessTime sx={{ mr: 0.5, fontSize: 16 }} />
                    {formatDate(classItem.date)} ({classItem.duration} min)
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <LocationOn sx={{ mr: 0.5, fontSize: 16 }} />
                    {classItem.location}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <Person sx={{ mr: 0.5, fontSize: 16 }} />
                    {classItem.currentParticipants}/{classItem.maxParticipants} participants
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <AttachMoney sx={{ mr: 0.5, fontSize: 16 }} />
                    ${classItem.price}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={classItem.level} size="small" variant="outlined" />
                    {classItem.equipment && (
                      <Chip label={`Equipment: ${classItem.equipment}`} size="small" variant="outlined" />
                    )}
                  </Box>

                  <Typography variant="body2" sx={{ mt: 2, color: 'textSecondary' }}>
                    {classItem.description}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedClass(classItem);
                      setOpenDialog(true);
                    }}
                    fullWidth
                  >
                    View Details & Join
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {classes.length === 0 && (
          <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: 'textSecondary' }}>
            No classes available at the moment
          </Typography>
        )}

        {/* Class Details Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedClass?.title}
          </DialogTitle>
          <DialogContent>
            {selectedClass && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Instructor: {selectedClass.trainer?.name}
                </Typography>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedClass.description}
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Category</Typography>
                    <Typography variant="body1">{selectedClass.category}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Level</Typography>
                    <Typography variant="body1">{selectedClass.level}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Date & Time</Typography>
                    <Typography variant="body1">{formatDate(selectedClass.date)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Duration</Typography>
                    <Typography variant="body1">{selectedClass.duration} minutes</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Location</Typography>
                    <Typography variant="body1">{selectedClass.location}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Price</Typography>
                    <Typography variant="body1">${selectedClass.price}</Typography>
                  </Grid>
                </Grid>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Participants:</strong> {selectedClass.currentParticipants}/{selectedClass.maxParticipants}
                </Typography>

                {selectedClass.equipment && (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Equipment needed:</strong> {selectedClass.equipment}
                  </Typography>
                )}

                {selectedClass.currentParticipants >= selectedClass.maxParticipants && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    This class is full!
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
            {selectedClass && selectedClass.currentParticipants < selectedClass.maxParticipants && (
              <Button
                onClick={() => handleJoinClass(selectedClass._id)}
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Joining...' : 'Join Class'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ClassesList;