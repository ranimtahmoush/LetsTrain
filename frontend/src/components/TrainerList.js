import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import {
	Container, Typography, Grid, Card, CardContent, CardActions, Button,
	TextField, MenuItem, InputLabel, Box, Paper, InputAdornment, Rating
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const categories = [
	'Weight Loss', 'Strength Training', 'Yoga', 'Meditation', 'Boxing',
	'HIIT', 'Pilates', 'Rehabilitation', 'Cardio', 'CrossFit'
];
const locations = [
	'Lebanon', 'Beirut', 'Tripoli', 'Tyre', 'Sidon', 'Jounieh'
];

const TrainerList = () => {
	const [trainers, setTrainers] = useState([]);
	const [filtered, setFiltered] = useState([]);
	const [searchName, setSearchName] = useState('');
	const [searchCategory, setSearchCategory] = useState('');
	const [searchLocation, setSearchLocation] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		const fetchTrainers = async () => {
			try {
				const res = await axios.get('http://localhost:5000/api/trainers');
				const trainersData = Array.isArray(res.data) ? res.data : [];
				setTrainers(trainersData);
				setFiltered(trainersData);
			} catch (err) {
				console.error('Failed to fetch trainers:', err);
				setTrainers([]);
				setFiltered([]);
			}
		};
		fetchTrainers();
	}, []);

	useEffect(() => {
		let result = trainers;
		if (searchName) {
			result = result.filter(t => t.user.name.toLowerCase().includes(searchName.toLowerCase()));
		}
		if (searchLocation) {
			result = result.filter(t => t.user.location === searchLocation);
		}
		if (searchCategory) {
			result = result.filter(t => t.specialties && t.specialties.includes(searchCategory));
		}
		setFiltered(result);
	}, [searchName, searchLocation, searchCategory, trainers]);

	// Mock rating function - replace with real data from your API
	const getTrainerRating = (trainerId) => {
		return 4.5 + (Math.random() * 0.5);
	};

	return (
		<>
			   <Header />
			   {/* HERO SECTION */}
			   <Box sx={{
			   minHeight: { xs: 420, md: 520 },
			   display: 'flex',
			   alignItems: 'center',
			   justifyContent: 'center',
			   position: 'relative',
			   background: `linear-gradient(rgba(30,30,30,0.55), rgba(30,30,30,0.55)), url('/gym-bg.jpg') center/cover no-repeat`,
			   mb: { xs: 8, md: 10 },
			   }}>
				   <Container maxWidth="lg" sx={{ zIndex: 2, py: { xs: 5, md: 8 } }}>
					   <Box sx={{ textAlign: 'center', color: '#fff', mb: 4 }}>
					   <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '2.4rem', sm: '3.5rem' }, mb: 1.5, letterSpacing: '-1px', lineHeight: 1.1 }}>
						   Find Your Trainer
					   </Typography>
					   <Typography variant="h5" sx={{ fontWeight: 400, color: 'rgba(255,255,255,0.92)', mb: 2, fontSize: { xs: '1.1rem', sm: '1.35rem' } }}>
							   Discover the perfect fitness coach for your goals
						   </Typography>
					   </Box>
					   {/* SEARCH/FILTER BOX */}
					   <Paper elevation={3} sx={{
						   p: { xs: 2.5, sm: 3.5 },
						   borderRadius: 3,
					   maxWidth: 700,
					   mx: 'auto',
					   background: 'rgba(255,255,255,0.97)',
					   display: 'flex',
					   flexDirection: { xs: 'column', sm: 'row' },
					   alignItems: 'center',
						   gap: 2,
						   boxShadow: '0 2px 12px rgba(229,57,53,0.08)',
						   transition: 'box-shadow 0.25s',
					   }}>
						   <TextField
							   size="small"
							   placeholder="Search trainers..."
							   value={searchName}
							   onChange={(e) => setSearchName(e.target.value)}
							   InputProps={{ startAdornment: <SearchIcon sx={{ color: '#e53935', mr: 1 }} /> }}
							   sx={{ flex: { xs: 1, sm: 1.2 }, minWidth: 180 }}
						   />
						   <TextField
							   select
							   size="small"
							   label="Location"
							   value={searchLocation}
							   onChange={(e) => setSearchLocation(e.target.value)}
							   InputProps={{
								   startAdornment: <LocationOnIcon sx={{ color: '#e53935', mr: 1, fontSize: 18 }} />
							   }}
							   sx={{ flex: 1, minWidth: 130 }}
						   >
							   <MenuItem value="">None</MenuItem>
							   {locations.map((loc) => (
								   <MenuItem key={loc} value={loc}>{loc}</MenuItem>
							   ))}
						   </TextField>
						   <TextField
							   select
							   size="small"
							   label="Specialty"
							   value={searchCategory}
							   onChange={(e) => setSearchCategory(e.target.value)}
							   InputProps={{
								   startAdornment: <FitnessCenterIcon sx={{ color: '#e53935', mr: 1, fontSize: 18 }} />
							   }}
							   sx={{ flex: 1, minWidth: 130 }}
						   >
							   <MenuItem value="">None</MenuItem>
							   {categories.map((cat) => (
								   <MenuItem key={cat} value={cat}>{cat}</MenuItem>
							   ))}
						   </TextField>
					   </Paper>
				   </Container>
			   </Box>
			   <Container sx={{ mt: 2, mb: 4 }}>
				   <Typography variant="body2" sx={{ mb: 4, color: '#666', fontWeight: 500 }}>
					   Found {filtered.length} trainer{filtered.length !== 1 ? 's' : ''}
				   </Typography>
				   <Grid container spacing={3}>
				{filtered.map(trainer => (
					<Grid item xs={12} sm={6} md={4} key={trainer._id}>
						<Card
							sx={{
								height: '100%',
								display: 'flex',
								flexDirection: 'column',
								cursor: 'pointer',
								transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
								border: '1px solid rgba(229, 57, 53, 0.08)',
								borderRadius: 3,
								overflow: 'hidden',
								boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
								'&:hover': {
									transform: 'translateY(-6px)',
									boxShadow: '0 12px 24px rgba(229, 57, 53, 0.12)',
									borderColor: 'rgba(229, 57, 53, 0.15)'
								}
							}}
							onClick={() => navigate(`/trainer/${trainer._id}`)}
						>
							<Box
								sx={{
									width: '100%',
									height: 220,
									backgroundColor: '#f0f0f0',
									overflow: 'hidden',
									position: 'relative'
								}}
							>
								<Box
									component="img"
									src={trainer.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop'}
									alt={trainer.user.name}
									sx={{
										width: '100%',
										height: '100%',
										objectFit: 'cover',
										objectPosition: 'center',
										transition: 'transform 0.3s ease',
										'&:hover': {
											transform: 'scale(1.05)'
										}
									}}
								/>
							</Box>
							<CardContent sx={{ flexGrow: 1, textAlign: 'center', pb: 1.5, pt: 2.5 }}>
								<Typography variant="h6" sx={{ fontWeight: 700, mb: 0.8, color: '#2a2a2a', fontSize: '1.1rem' }}>
									{trainer.user.name}
								</Typography>
								
								<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.8, mb: 1.2 }}>
									<Rating 
										value={getTrainerRating(trainer._id)} 
										readOnly 
										size="small"
										sx={{ fontSize: '1rem' }}
									/>
									<Typography variant="caption" sx={{ color: '#999', fontWeight: 500 }}>
										{getTrainerRating(trainer._id).toFixed(1)}
									</Typography>
								</Box>

								<Typography color="text.secondary" variant="body2" sx={{ mb: 1.2, color: '#888', fontSize: '0.9rem', fontWeight: 500 }}>
									{trainer.specialties && trainer.specialties.length > 0 ? trainer.specialties.slice(0, 2).join(', ') : 'No specialties'}
								</Typography>
								<Typography variant="body2" sx={{ mb: 2, color: '#999', fontSize: '0.9rem' }}>
									📍 {trainer.user.location}
								</Typography>
								<Typography variant="h6" sx={{ color: '#e53935', fontWeight: 700, fontSize: '1.25rem' }}>
									${trainer.pricePerSession}<span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 500 }}>/session</span>
								</Typography>
							</CardContent>
							<CardActions sx={{ justifyContent: 'center', pt: 0, pb: 2 }}>
								<Button
									size="small"
									variant="contained"
									sx={{
										backgroundColor: '#e53935',
										color: '#fff',
										fontWeight: 700,
										fontSize: '0.9rem',
										textTransform: 'uppercase',
										letterSpacing: '0.5px',
										paddingX: 3.5,
										paddingY: 1.1,
										borderRadius: 1.8,
										transition: 'all 0.3s ease',
										'&:hover': { 
											backgroundColor: '#d32f2f',
											boxShadow: '0 6px 16px rgba(229, 57, 53, 0.3)'
										},
										'&:active': {
											transform: 'scale(0.98)'
										}
									}}
									onClick={e => {
										e.stopPropagation();
										navigate(`/trainer/${trainer._id}`);
									}}
								>
									View Profile
								</Button>
							</CardActions>
						</Card>
					</Grid>
				))}
				   </Grid>
				   {filtered.length === 0 && (
					   <Typography variant="h6" align="center" sx={{ mt: 6, color: '#999' }}>
						   No trainers found matching your criteria. Try adjusting your search.
					   </Typography>
				   )}
		   </Container>
		   </>
	   );
};

export default TrainerList;
