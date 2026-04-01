import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import {
	Container, Typography, Grid, Card, CardContent, CardActions, Button,
	TextField, Select, MenuItem, FormControl, InputLabel, Box, Paper, InputAdornment, Rating
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

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
				setTrainers(res.data);
				setFiltered(res.data);
			} catch (err) {
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
			<Container sx={{ mt: 12, mb: 4 }}>
				<Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5, color: '#2a2a2a' }}>
					FIND YOUR TRAINER
				</Typography>
				<Typography variant="body1" sx={{ mb: 3.5, color: '#666', fontWeight: 400 }}>
					Discover the perfect fitness coach for your goals
				</Typography>
				<Paper elevation={0} sx={{ 
					padding: { xs: 2.2, sm: 3, md: 3.5 }, 
					backgroundColor: '#fafafa', 
					borderRadius: 2.5,
					border: '1px solid rgba(229, 57, 53, 0.08)',
					mb: 4,
					boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
				}}>
					<Box
						sx={{
							display: 'grid',
							gap: { xs: 1.4, sm: 1.8, md: 2.2 },
							gridTemplateColumns: {
								xs: '1fr',
								sm: 'repeat(2, minmax(0, 1fr))',
								md: '1.7fr 1fr 1fr',
							},
						}}
					>
					<Box sx={{ gridColumn: { xs: 'auto', sm: 'span 2', md: 'auto' } }}>
						<TextField
							fullWidth
							label="Search by Name"
							variant="outlined"
							size="medium"
							value={searchName}
							onChange={e => setSearchName(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ color: '#e53935', fontSize: 22 }} />
									</InputAdornment>
								),
								style: { fontSize: '1rem', fontWeight: 500 }
							}}
							InputLabelProps={{ style: { fontSize: '0.98rem' } }}
							sx={{
								'& .MuiOutlinedInput-root': {
									backgroundColor: '#fff',
									borderRadius: 2,
									minHeight: 56,
									transition: 'all 0.2s ease',
									'& fieldset': { borderColor: '#ddd' },
									'&:hover fieldset': { borderColor: '#e53935', borderWidth: '1.5px' },
									'&.Mui-focused fieldset': { borderColor: '#e53935', borderWidth: '1.5px' },
									'&.Mui-focused': { boxShadow: '0 0 0 4px rgba(229, 57, 53, 0.08)' },
								}
							}}
						/>
					</Box>
					<Box>
						<FormControl fullWidth size="medium">
							<InputLabel sx={{ fontSize: '0.98rem' }}>Location</InputLabel>
							<Select
								value={searchLocation}
								onChange={e => setSearchLocation(e.target.value)}
								label="Location"
								displayEmpty
								MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
								sx={{ 
									fontSize: '1rem',
									backgroundColor: '#fff',
									borderRadius: 2,
									minHeight: 56,
									transition: 'all 0.2s ease',
									'& fieldset': { borderColor: '#ddd' },
									'&:hover fieldset': { borderColor: '#e53935', borderWidth: '1.5px' },
									'&.Mui-focused fieldset': { borderColor: '#e53935', borderWidth: '1.5px' },
									'&.Mui-focused': { boxShadow: '0 0 0 4px rgba(229, 57, 53, 0.08)' },
									'& .MuiSelect-select': {
										whiteSpace: 'normal',
										textOverflow: 'clip',
										lineHeight: 1.35,
									}
								}}
							>
								<MenuItem value="">All Locations</MenuItem>
								{locations.map(loc => (
									<MenuItem key={loc} value={loc}>{loc}</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
					<Box>
						<FormControl fullWidth size="medium">
							<InputLabel sx={{ fontSize: '0.98rem' }}>Specialty</InputLabel>
							<Select
								value={searchCategory}
								onChange={e => setSearchCategory(e.target.value)}
								label="Specialty"
								displayEmpty
								MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
								sx={{ 
									fontSize: '1rem',
									backgroundColor: '#fff',
									borderRadius: 2,
									minHeight: 56,
									transition: 'all 0.2s ease',
									'& fieldset': { borderColor: '#ddd' },
									'&:hover fieldset': { borderColor: '#e53935', borderWidth: '1.5px' },
									'&.Mui-focused fieldset': { borderColor: '#e53935', borderWidth: '1.5px' },
									'&.Mui-focused': { boxShadow: '0 0 0 4px rgba(229, 57, 53, 0.08)' },
									'& .MuiSelect-select': {
										whiteSpace: 'normal',
										textOverflow: 'clip',
										lineHeight: 1.35,
									}
								}}
							>
								<MenuItem value="">All Specialties</MenuItem>
								{categories.map(cat => (
									<MenuItem key={cat} value={cat}>{cat}</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
					</Box>
			</Paper>
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
