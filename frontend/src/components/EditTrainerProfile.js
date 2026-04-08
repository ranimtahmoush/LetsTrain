import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Select,
  MenuItem
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const EditTrainerProfile = () => {
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    bio: '',
    specialties: [],
    experience: '',
    certificates: [],
    certificateFiles: [],
    pricePerSession: '',
    location: ''
  });

  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCertificate, setNewCertificate] = useState('');

  const specialtyOptions = [
    'Weight Loss',
    'Strength Training',
    'Yoga',
    'Meditation',
    'Boxing',
    'HIIT',
    'Pilates',
    'Rehabilitation',
    'CrossFit',
    'Functional Training',
    'Cardio',
    'Mobility'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };

        const userRes = await axios.get('http://localhost:5000/api/auth/me', { headers });
        setUser(userRes.data);

        try {
          const trainerRes = await axios.get('http://localhost:5000/api/trainers/profile/me', { headers });
          setTrainer(trainerRes.data);

          setFormData({
            bio: trainerRes.data.bio || '',
            specialties: trainerRes.data.specialties || [],
            experience: trainerRes.data.experience || '',
            certificates: trainerRes.data.certificates || [],
            certificateFiles: [],
            pricePerSession: trainerRes.data.pricePerSession || '',
            location: userRes.data.location || ''
          });
        } catch (trainerErr) {
          // If trainer profile doesn't exist, that's okay - we'll create one
          if (trainerErr.response?.status === 404) {
            setFormData({
              bio: '',
              specialties: [],
              experience: '',
              certificates: [],
              certificateFiles: [],
              pricePerSession: '',
              location: userRes.data.location || ''
            });
            setError('');
          } else {
            throw trainerErr;
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Failed to load profile data');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSpecialty = () => {
    if (newSpecialty && !formData.specialties.includes(newSpecialty)) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty]
      });
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (specialty) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== specialty)
    });
  };

  const handleAddCertificate = () => {
    if (newCertificate && !formData.certificates.includes(newCertificate)) {
      setFormData({
        ...formData,
        certificates: [...formData.certificates, newCertificate]
      });
      setNewCertificate('');
    }
  };

  const handleRemoveCertificate = (certificate) => {
    setFormData({
      ...formData,
      certificates: formData.certificates.filter(c => c !== certificate)
    });
  };

  const handleCertificateFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      certificateFiles: [...formData.certificateFiles, ...files]
    });
  };

  const handleRemoveCertificateFile = (index) => {
    setFormData({
      ...formData,
      certificateFiles: formData.certificateFiles.filter((_, i) => i !== index)
    });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      // Prepare profile data
      const profileData = {
        bio: formData.bio,
        specialties: formData.specialties,
        experience: parseInt(formData.experience) || 0,
        certificates: formData.certificates,
        pricePerSession: parseFloat(formData.pricePerSession) || 0
      };

      // Create or update trainer profile
      if (trainer?._id) {
        // Update existing profile
        await axios.put(
          `http://localhost:5000/api/trainers/${trainer._id}`,
          profileData,
          { headers }
        );
      } else {
        // Create new profile
        await axios.post(
          'http://localhost:5000/api/trainers',
          profileData,
          { headers }
        );
      }

      // Update user location if it changed
      if (formData.location !== user.location) {
        await axios.put(
          'http://localhost:5000/api/auth/me',
          { location: formData.location },
          { headers }
        );
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/trainer-dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/trainers');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Edit Trainer Profile</Typography>
          <Button color="inherit" onClick={() => navigate('/trainer-dashboard')}>
            Back to Dashboard
          </Button>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Paper sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Grid container spacing={3}>
            {/* About Me Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>About Me</Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell clients about yourself, your training approach, and why they should choose you..."
              />
            </Grid>

            {/* Location Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Location</Typography>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Your training location (e.g., Beirut, Tripoli)"
              />
            </Grid>

            {/* Experience Section */}
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Years of Experience</Typography>
              <TextField
                fullWidth
                type="number"
                label="Years of Experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Price Section */}
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Price Per Session</Typography>
              <TextField
                fullWidth
                type="number"
                label="Price Per Session ($)"
                name="pricePerSession"
                value={formData.pricePerSession}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Specialties Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Specialties</Typography>
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formData.specialties.map((specialty, index) => (
                  <Chip
                    key={index}
                    label={specialty}
                    onDelete={() => handleRemoveSpecialty(specialty)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Select
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  displayEmpty
                  sx={{ flex: 1, minWidth: 250 }}
                >
                  <MenuItem value="">Choose a specialty...</MenuItem>
                  {specialtyOptions.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </Select>
                <Button
                  variant="outlined"
                  onClick={handleAddSpecialty}
                  disabled={!newSpecialty}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Add
                </Button>
              </Box>
            </Grid>

            {/* Certificates Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Certificates & Qualifications</Typography>
              
              {/* Text-based Certificates */}
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Certificate Names</Typography>
              <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formData.certificates.map((certificate, index) => (
                  <Chip
                    key={index}
                    label={certificate}
                    onDelete={() => handleRemoveCertificate(certificate)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <TextField
                  fullWidth
                  label="Add Certificate Name"
                  value={newCertificate}
                  onChange={(e) => setNewCertificate(e.target.value)}
                  placeholder="e.g., Certified Personal Trainer, Nutrition Specialist..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCertificate();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddCertificate}
                  disabled={!newCertificate}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Add
                </Button>
              </Box>

              {/* Certificate Files Upload */}
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Upload Certificate Images</Typography>
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formData.certificateFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => handleRemoveCertificateFile(index)}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                <Box
                  sx={{
                    border: '2px dashed #1976d2',
                    borderRadius: 1,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                  component="label"
                >
                  <CloudUploadIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Click to upload or drag certificate files
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Supports: images (PNG, JPG, GIF) and PDFs
                  </Typography>
                  <input
                    hidden
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleCertificateFileUpload}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Save Button */}
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSaveProfile}
                disabled={saving}
                startIcon={<SaveIcon />}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default EditTrainerProfile;