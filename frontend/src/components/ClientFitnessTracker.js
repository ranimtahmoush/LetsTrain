import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';

const ClientFitnessTracker = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [fitnessMetrics, setFitnessMetrics] = useState([]);
  const [goals, setGoals] = useState([]);

  // Workout Log form
  const [workoutForm, setWorkoutForm] = useState({
    date: new Date().toISOString().split('T')[0],
    exerciseName: '',
    duration: '',
    sets: '',
    reps: '',
    weight: '',
    notes: ''
  });

  // Progress Photo form
  const [photoForm, setPhotoForm] = useState({
    imageUrl: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Fitness Metric form
  const [metricForm, setMetricForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFat: '',
    muscleWeight: '',
    notes: ''
  });

  // Goal form
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    weightLoss: '',
    duration: '',
    sessionsPerWeek: ''
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      const [logs, photos, metrics, goalsData] = await Promise.all([
        axios.get('/api/progress/workout-logs', { headers }),
        axios.get('/api/progress/progress-photos', { headers }),
        axios.get('/api/progress/fitness-metrics', { headers }),
        axios.get('/api/progress/goals', { headers })
      ]);

      setWorkoutLogs(Array.isArray(logs.data) ? logs.data : []);
      setProgressPhotos(Array.isArray(photos.data) ? photos.data : []);
      setFitnessMetrics(Array.isArray(metrics.data) ? metrics.data : []);
      setGoals(Array.isArray(goalsData.data) ? goalsData.data : []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setWorkoutLogs([]);
      setProgressPhotos([]);
      setFitnessMetrics([]);
      setGoals([]);
    }
  };

  const addWorkoutLog = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/progress/workout-logs', workoutForm, {
        headers: { 'x-auth-token': token }
      });
      setWorkoutLogs([response.data, ...workoutLogs]);
      setWorkoutForm({
        date: new Date().toISOString().split('T')[0],
        exerciseName: '',
        duration: '',
        sets: '',
        reps: '',
        weight: '',
        notes: ''
      });
      setOpenDialog(false);
    } catch (err) {
      console.error('Error adding workout log:', err);
    }
  };

  const deleteWorkoutLog = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/progress/workout-logs/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setWorkoutLogs(workoutLogs.filter(log => log._id !== id));
    } catch (err) {
      console.error('Error deleting workout log:', err);
    }
  };

  const addProgressPhoto = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/progress/progress-photos', photoForm, {
        headers: { 'x-auth-token': token }
      });
      setProgressPhotos([response.data, ...progressPhotos]);
      setPhotoForm({
        imageUrl: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setOpenDialog(false);
    } catch (err) {
      console.error('Error adding progress photo:', err);
    }
  };

  const deleteProgressPhoto = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/progress/progress-photos/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setProgressPhotos(progressPhotos.filter(photo => photo._id !== id));
    } catch (err) {
      console.error('Error deleting progress photo:', err);
    }
  };

  const addFitnessMetric = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/progress/fitness-metrics', metricForm, {
        headers: { 'x-auth-token': token }
      });
      setFitnessMetrics([response.data, ...fitnessMetrics]);
      setMetricForm({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        bodyFat: '',
        muscleWeight: '',
        notes: ''
      });
      setOpenDialog(false);
    } catch (err) {
      console.error('Error adding fitness metric:', err);
    }
  };

  const deleteFitnessMetric = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/progress/fitness-metrics/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setFitnessMetrics(fitnessMetrics.filter(metric => metric._id !== id));
    } catch (err) {
      console.error('Error deleting fitness metric:', err);
    }
  };

  const addGoal = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/progress/goals', goalForm, {
        headers: { 'x-auth-token': token }
      });
      setGoals([response.data, ...goals]);
      setGoalForm({
        title: '',
        description: '',
        weightLoss: '',
        duration: '',
        sessionsPerWeek: ''
      });
      setOpenDialog(false);
    } catch (err) {
      console.error('Error adding goal:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/trainers');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <>
        <AppBar position="static" sx={{ mb: 4 }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Fitness Tracker</Typography>
            <Button color="inherit" onClick={() => navigate('/client-dashboard')}>
              Back to Dashboard
            </Button>
            <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Fitness Tracking</Typography>

        <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Workout Logs" />
          <Tab label="Progress Photos" />
          <Tab label="Fitness Metrics" />
          <Tab label="Goals" />
        </Tabs>
      </Paper>

      {/* Workout Logs Tab */}
      {activeTab === 0 && (
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mb: 2 }}
            onClick={() => { setDialogType('workout'); setOpenDialog(true); }}
          >
            Log Workout
          </Button>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Exercise</strong></TableCell>
                  <TableCell><strong>Duration (min)</strong></TableCell>
                  <TableCell><strong>Sets</strong></TableCell>
                  <TableCell><strong>Reps</strong></TableCell>
                  <TableCell><strong>Weight (kg)</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workoutLogs.map(log => (
                  <TableRow key={log._id}>
                    <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                    <TableCell>{log.exerciseName}</TableCell>
                    <TableCell>{log.duration}</TableCell>
                    <TableCell>{log.sets}</TableCell>
                    <TableCell>{log.reps}</TableCell>
                    <TableCell>{log.weight || '-'}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => deleteWorkoutLog(log._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {workoutLogs.length === 0 && <Typography sx={{ mt: 2, textAlign: 'center', color: '#999' }}>No workout logs yet</Typography>}
        </Box>
      )}

      {/* Progress Photos Tab */}
      {activeTab === 1 && (
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mb: 2 }}
            onClick={() => { setDialogType('photo'); setOpenDialog(true); }}
          >
            Add Progress Photo
          </Button>
          <Grid container spacing={2}>
            {progressPhotos.map(photo => (
              <Grid item xs={12} sm={6} md={4} key={photo._id}>
                <Card>
                  <Box
                    component="img"
                    src={photo.imageUrl}
                    alt="progress"
                    sx={{ width: '100%', height: 250, objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(photo.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>{photo.notes}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => deleteProgressPhoto(photo._id)}
                      sx={{ mt: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {progressPhotos.length === 0 && <Typography sx={{ mt: 2, textAlign: 'center', color: '#999' }}>No progress photos yet</Typography>}
        </Box>
      )}

      {/* Fitness Metrics Tab */}
      {activeTab === 2 && (
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mb: 2 }}
            onClick={() => { setDialogType('metric'); setOpenDialog(true); }}
          >
            Log Metrics
          </Button>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Weight (kg)</strong></TableCell>
                  <TableCell><strong>Body Fat %</strong></TableCell>
                  <TableCell><strong>Muscle Weight (kg)</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fitnessMetrics.map(metric => (
                  <TableRow key={metric._id}>
                    <TableCell>{new Date(metric.date).toLocaleDateString()}</TableCell>
                    <TableCell>{metric.weight}</TableCell>
                    <TableCell>{metric.bodyFat || '-'}</TableCell>
                    <TableCell>{metric.muscleWeight || '-'}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => deleteFitnessMetric(metric._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {fitnessMetrics.length === 0 && <Typography sx={{ mt: 2, textAlign: 'center', color: '#999' }}>No fitness metrics yet</Typography>}
        </Box>
      )}

      {/* Goals Tab */}
      {activeTab === 3 && (
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mb: 2 }}
            onClick={() => { setDialogType('goal'); setOpenDialog(true); }}
          >
            Set Goal
          </Button>
          <Grid container spacing={2}>
            {goals.map(goal => (
              <Grid item xs={12} sm={6} md={4} key={goal._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{goal.title}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>{goal.description}</Typography>
                    <Typography variant="body2">
                      <strong>Duration:</strong> {goal.duration} weeks
                    </Typography>
                    <Typography variant="body2">
                      <strong>Sessions/Week:</strong> {goal.sessionsPerWeek}
                    </Typography>
                    {goal.weightLoss && (
                      <Typography variant="body2">
                        <strong>Weight Loss Goal:</strong> {goal.weightLoss} kg
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {goals.length === 0 && <Typography sx={{ mt: 2, textAlign: 'center', color: '#999' }}>No goals set yet</Typography>}
        </Box>
      )}

      {/* Dialog for adding new entries */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'workout' && 'Log Workout'}
          {dialogType === 'photo' && 'Add Progress Photo'}
          {dialogType === 'metric' && 'Log Fitness Metrics'}
          {dialogType === 'goal' && 'Set New Goal'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {dialogType === 'workout' && (
            <>
              <DatePicker label="Date" value={workoutForm.date ? dayjs(workoutForm.date) : null} onChange={(newDate) => setWorkoutForm({ ...workoutForm, date: newDate ? newDate.format('YYYY-MM-DD') : '' })} slotProps={{ textField: { fullWidth: true } }} />
              <TextField label="Exercise Name" value={workoutForm.exerciseName} onChange={(e) => setWorkoutForm({ ...workoutForm, exerciseName: e.target.value })} />
              <TextField type="number" label="Duration (minutes)" value={workoutForm.duration} onChange={(e) => setWorkoutForm({ ...workoutForm, duration: e.target.value })} />
              <TextField type="number" label="Sets" value={workoutForm.sets} onChange={(e) => setWorkoutForm({ ...workoutForm, sets: e.target.value })} />
              <TextField type="number" label="Reps" value={workoutForm.reps} onChange={(e) => setWorkoutForm({ ...workoutForm, reps: e.target.value })} />
              <TextField type="number" label="Weight (kg)" value={workoutForm.weight} onChange={(e) => setWorkoutForm({ ...workoutForm, weight: e.target.value })} />
              <TextField label="Notes" multiline rows={3} value={workoutForm.notes} onChange={(e) => setWorkoutForm({ ...workoutForm, notes: e.target.value })} />
            </>
          )}

          {dialogType === 'photo' && (
            <>
              <DatePicker label="Date" value={photoForm.date ? dayjs(photoForm.date) : null} onChange={(newDate) => setPhotoForm({ ...photoForm, date: newDate ? newDate.format('YYYY-MM-DD') : '' })} slotProps={{ textField: { fullWidth: true } }} />
              <TextField label="Image URL" value={photoForm.imageUrl} onChange={(e) => setPhotoForm({ ...photoForm, imageUrl: e.target.value })} fullWidth />
              <TextField label="Notes" multiline rows={3} value={photoForm.notes} onChange={(e) => setPhotoForm({ ...photoForm, notes: e.target.value })} />
            </>
          )}

          {dialogType === 'metric' && (
            <>
              <DatePicker label="Date" value={metricForm.date ? dayjs(metricForm.date) : null} onChange={(newDate) => setMetricForm({ ...metricForm, date: newDate ? newDate.format('YYYY-MM-DD') : '' })} slotProps={{ textField: { fullWidth: true } }} />
              <TextField type="number" label="Weight (kg)" value={metricForm.weight} onChange={(e) => setMetricForm({ ...metricForm, weight: e.target.value })} />
              <TextField type="number" label="Body Fat %" value={metricForm.bodyFat} onChange={(e) => setMetricForm({ ...metricForm, bodyFat: e.target.value })} />
              <TextField type="number" label="Muscle Weight (kg)" value={metricForm.muscleWeight} onChange={(e) => setMetricForm({ ...metricForm, muscleWeight: e.target.value })} />
              <TextField label="Notes" multiline rows={3} value={metricForm.notes} onChange={(e) => setMetricForm({ ...metricForm, notes: e.target.value })} />
            </>
          )}

          {dialogType === 'goal' && (
            <>
              <TextField label="Goal Title" value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} />
              <TextField label="Description" multiline rows={3} value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} />
              <TextField type="number" label="Weight Loss Goal (kg)" value={goalForm.weightLoss} onChange={(e) => setGoalForm({ ...goalForm, weightLoss: e.target.value })} />
              <TextField type="number" label="Duration (weeks)" value={goalForm.duration} onChange={(e) => setGoalForm({ ...goalForm, duration: e.target.value })} />
              <TextField type="number" label="Sessions per Week" value={goalForm.sessionsPerWeek} onChange={(e) => setGoalForm({ ...goalForm, sessionsPerWeek: e.target.value })} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (dialogType === 'workout') addWorkoutLog();
              else if (dialogType === 'photo') addProgressPhoto();
              else if (dialogType === 'metric') addFitnessMetric();
              else if (dialogType === 'goal') addGoal();
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
        </>
      </LocalizationProvider>
    );
};

export default ClientFitnessTracker;