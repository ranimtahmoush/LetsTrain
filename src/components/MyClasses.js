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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar
} from '@mui/material';
import { AccessTime, LocationOn, Person, AttachMoney } from '@mui/icons-material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/classes/trainer/my-classes', {
        headers: { 'x-auth-token': token }
      });
      setClasses(res.data);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const handleCancelClass = async (classId) => {
    if (!window.confirm('Are you sure you want to cancel this class? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/classes/${classId}`, {
        headers: { 'x-auth-token': token }
      });
      await fetchClasses();
      alert('Class cancelled successfully');
    } catch (err) {
      alert('Error cancelling class');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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
      <AppBar position="static" sx={{ mb: 4, backgroundColor: '#e53935' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#fff' }}>My Classes</Typography>
          <Button sx={{ color: '#fff' }} onClick={() => navigate('/create-class')}>
            Create New Class
          </Button>
          <Button sx={{ color: '#fff' }} onClick={() => navigate('/trainer-dashboard')}>
            Back to Dashboard
          </Button>
          <Button sx={{ color: '#fff' }} onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center', color: '#e53935' }}>
          Manage Your Classes
        </Typography>

        <Grid container spacing={3}>
          {classes.map((classItem) => (
            <Grid item xs={12} sm={6} md={4} key={classItem._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {classItem.title}
                    </Typography>
                    <Chip
                      label={classItem.status}
                      color={getStatusColor(classItem.status)}
                      size="small"
                    />
                  </Box>

                  <Chip
                    label={classItem.category}
                    size="small"
                    variant="outlined"
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
                    ${classItem.price} per person
                  </Typography>

                  <Typography variant="body2" sx={{ color: 'textSecondary' }}>
                    {classItem.description.length > 100
                      ? `${classItem.description.substring(0, 100)}...`
                      : classItem.description
                    }
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedClass(classItem);
                      setOpenDialog(true);
                    }}
                    fullWidth
                  >
                    View Participants
                  </Button>
                  {classItem.status === 'active' && (
                    <>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleCancelClass(classItem._id)}
                        sx={{ ml: 1 }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {classes.length === 0 && (
          <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: 'textSecondary' }}>
            You haven't created any classes yet
          </Typography>
        )}

        {/* Participants Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Participants - {selectedClass?.title}
          </DialogTitle>
          <DialogContent>
            {selectedClass && (
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedClass.currentParticipants} of {selectedClass.maxParticipants} spots filled
                </Typography>

                {selectedClass.participants && selectedClass.participants.length > 0 ? (
                  <List>
                    {selectedClass.participants.map((participant, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={participant.user?.name || 'Unknown'}
                          secondary={`Joined: ${new Date(participant.joinedAt).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="textSecondary">
                    No participants yet
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default MyClasses;