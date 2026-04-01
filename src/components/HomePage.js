import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Box, Container, Typography, Button, Grid, Paper, TextField, FormControl, Select, MenuItem, InputAdornment, Chip, Avatar, Divider, Link
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import Header from './Header';

const specialties = [
	{ label: 'Weight Loss' },
	{ label: 'Strength Training' },
	{ label: 'Yoga' },
	{ label: 'Meditation' },
	{ label: 'Boxing' },
	{ label: 'HIIT' },
	{ label: 'Pilates' },
	{ label: 'Rehabilitation' },
	{ label: 'Cardio' },
	{ label: 'CrossFit' },
];
const locations = [
	'Lebanon', 'Beirut', 'Tripoli', 'Tyre', 'Sidon', 'Jounieh'
];
const allSpecialties = [
	'Weight Loss', 'Strength Training', 'Yoga', 'Meditation', 'Boxing', 'HIIT', 'Pilates', 'Rehabilitation', 'Cardio', 'CrossFit',
	'Nutrition', 'Bodybuilding', 'Endurance', 'Mobility', 'Athletic Performance', 'Dance Fitness', 'TRX', 'Aqua Fitness', 'Senior Fitness', 'Prenatal', 'Postnatal', 'Sports Specific', 'Functional Training', 'Zumba', 'Martial Arts', 'Stretching', 'Balance', 'Wellness Coaching', 'Group Training', 'Personal Training', 'Bootcamp', 'Powerlifting', 'Calisthenics', 'Spinning', 'Aerobics', 'Kettlebell', 'Core', 'Flexibility', 'Obstacle Course', 'Parkour', 'Strongman', 'Kids Fitness', 'Adaptive Fitness', 'Other'
];

const mockTrainers = [
	{
		_id: '1',
		user: { name: 'Sarah Lee', location: 'Beirut' },
		specialties: ['Yoga', 'HIIT'],
		pricePerSession: 30,
		profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg',
		rating: 4.8,
	},
	{
		_id: '2',
		user: { name: 'Mike Johnson', location: 'Tripoli' },
		specialties: ['Strength Training', 'Boxing'],
		pricePerSession: 40,
		profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
		rating: 4.7,
	},
	{
		_id: '3',
		user: { name: 'Layla Haddad', location: 'Sidon' },
		specialties: ['Pilates', 'Cardio'],
		pricePerSession: 35,
		profilePicture: 'https://randomuser.me/api/portraits/women/65.jpg',
		rating: 4.9,
	},
	// ...add more mock trainers as needed
];

const popularCategories = allSpecialties.slice(0, 10);

const HomePage = () => {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedLocation, setSelectedLocation] = useState('');
	const [selectedSpecialty, setSelectedSpecialty] = useState('');
	const [trendingSpecialty, setTrendingSpecialty] = useState(popularCategories[0]);
	const [showAllCategories, setShowAllCategories] = useState(false);

	const trendingTrainers = trendingSpecialty === 'All'
		? mockTrainers
		: mockTrainers.filter(t => t.specialties.includes(trendingSpecialty));

	// For demo: add review count to trainers
	const getReviewCount = (id) => {
		if (id === '1') return 12;
		if (id === '2') return 8;
		if (id === '3') return 15;
		return 5;
	};

	const handleExplore = () => {
		navigate('/trainers', {
			state: {
				searchQuery,
				location: selectedLocation,
				specialty: selectedSpecialty,
			},
		});
	};

	return (
		<>
			<Header />
			<Box className="homepage-background" sx={{ minHeight: '100vh', pt: 0, position: 'relative', background: '#fafbfc' }}>
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
					<Container maxWidth="md" sx={{ zIndex: 2, py: { xs: 6, md: 10 } }}>
						<Box sx={{ textAlign: 'center', color: '#fff', mb: 4 }}>
							<Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '2.2rem', sm: '3.2rem' }, mb: 2, letterSpacing: '-1px', lineHeight: 1.1 }}>
								Find Your Perfect Trainer or Class
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 400, color: 'rgba(255,255,255,0.92)', mb: 4, fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
								Start your fitness journey today with LetsTrain
							</Typography>
							<Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center', mb: 3 }}>
								<Button
									variant="contained"
									size="large"
									sx={{
										backgroundColor: '#e53935',
										color: '#fff',
										fontWeight: 700,
										px: 4,
										py: 1.5,
										fontSize: '1.1rem',
										minWidth: 180,
										borderRadius: 3,
										boxShadow: '0 2px 8px rgba(229,57,53,0.10)',
										transition: 'all 0.25s',
										'&:hover': { backgroundColor: '#b71c1c', boxShadow: '0 4px 16px rgba(229,57,53,0.18)' }
									}}
									onClick={() => navigate('/trainers')}
								>
									<PersonSearchIcon sx={{ mr: 1, fontSize: 24 }} /> Find Trainers
								</Button>
								<Button
									variant="outlined"
									size="large"
									sx={{
										borderColor: '#fff',
										color: '#fff',
										fontWeight: 700,
										px: 4,
										py: 1.5,
										fontSize: '1.1rem',
										minWidth: 180,
										borderRadius: 3,
										boxShadow: '0 2px 8px rgba(229,57,53,0.10)',
										transition: 'all 0.25s',
										'&:hover': { borderColor: '#e53935', color: '#e53935', background: '#fff', boxShadow: '0 4px 16px rgba(229,57,53,0.10)' }
									}}
									onClick={() => navigate('/classes')}
								>
									<EventAvailableIcon sx={{ mr: 1, fontSize: 24 }} /> Explore Classes
								</Button>
							</Box>
						</Box>
						{/* SEARCH BAR */}
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
							mt: 2,
							boxShadow: '0 2px 12px rgba(229,57,53,0.08)',
							transition: 'box-shadow 0.25s',
						}}>
							<TextField
								fullWidth
								placeholder="Search trainers"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								variant="outlined"
								size="medium"
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon sx={{ color: '#e53935' }} />
										</InputAdornment>
									),
									style: { fontSize: '1.1rem', background: '#fff', borderRadius: 2 }
								}}
								sx={{ minWidth: 180 }}
							/>
							<FormControl fullWidth size="medium">
								<Select
									displayEmpty
									value={selectedLocation}
									onChange={(e) => setSelectedLocation(e.target.value)}
									renderValue={(selected) => selected ? selected : <span style={{ color: '#aaa' }}>Select city</span>}
									sx={{ fontSize: '1.1rem', background: '#fff', borderRadius: 2, minWidth: 150 }}
									inputProps={{ style: { fontSize: '1.1rem', minHeight: 48 } }}
								>
									<MenuItem value="" disabled>Select city</MenuItem>
									{locations.map((loc) => (
										<MenuItem key={loc} value={loc}>{loc}</MenuItem>
									))}
								</Select>
							</FormControl>
							<FormControl fullWidth size="medium">
								<Select
									displayEmpty
									value={selectedSpecialty}
									onChange={(e) => setSelectedSpecialty(e.target.value)}
									renderValue={(selected) => selected ? selected : <span style={{ color: '#aaa' }}>Choose specialty</span>}
									sx={{ fontSize: '1.1rem', background: '#fff', borderRadius: 2, minWidth: 150 }}
									inputProps={{ style: { fontSize: '1.1rem', minHeight: 48 } }}
								>
									<MenuItem value="" disabled>Choose specialty</MenuItem>
									{specialties.map((spec) => (
										<MenuItem key={spec.label} value={spec.label}>{spec.label}</MenuItem>
									))}
								</Select>
							</FormControl>
							<Button
								variant="contained"
								sx={{
									backgroundColor: '#e53935',
									color: '#fff',
									fontWeight: 700,
									px: 4,
									py: 1.5,
									fontSize: '1.1rem',
									minWidth: 120,
									height: 48,
									borderRadius: 3,
									boxShadow: '0 2px 8px rgba(229,57,53,0.10)',
									transition: 'all 0.25s',
									'&:hover': { backgroundColor: '#b71c1c', boxShadow: '0 4px 16px rgba(229,57,53,0.18)' }
								}}
								onClick={handleExplore}
							>
								Search
							</Button>
						</Paper>
					</Container>
				</Box>

				{/* HOW IT WORKS SECTION */}
				<Container maxWidth="lg" sx={{ mt: { xs: 10, md: 10 }, mb: { xs: 10, md: 10 } }}>
					<Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'center', alignItems: 'center', gap: 6 }}>
						<Box sx={{ textAlign: 'center', flex: 1 }}>
							<FitnessCenterIcon sx={{ fontSize: 48, color: '#e53935', mb: 1 }} />
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Find a trainer or class near you</Typography>
							<Typography variant="body2" sx={{ color: '#555' }}>Browse top trainers and group classes in your area.</Typography>
						</Box>
						<Box sx={{ textAlign: 'center', flex: 1 }}>
							<EventAvailableIcon sx={{ fontSize: 48, color: '#e53935', mb: 1 }} />
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Book a session or group class</Typography>
							<Typography variant="body2" sx={{ color: '#555' }}>Reserve your spot instantly and securely online.</Typography>
						</Box>
						<Box sx={{ textAlign: 'center', flex: 1 }}>
							<StarIcon sx={{ fontSize: 48, color: '#e53935', mb: 1 }} />
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Start your fitness journey</Typography>
							<Typography variant="body2" sx={{ color: '#555' }}>Achieve your goals with expert guidance and support.</Typography>
						</Box>
					</Box>
				</Container>

				{/* CATEGORIES SECTION */}
				<Container maxWidth="lg" sx={{ mt: { xs: 10, md: 10 }, mb: { xs: 10, md: 10 } }}>
					<Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e53935', mb: 2, textAlign: 'center' }}>
						Trending Categories
					</Typography>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mb: 3 }}>
						{(showAllCategories ? allSpecialties : popularCategories).map((cat) => (
							<Chip
								key={cat}
								label={cat}
								color={trendingSpecialty === cat ? 'primary' : 'default'}
								onClick={() => setTrendingSpecialty(cat)}
								sx={{
									fontWeight: 600,
									fontSize: '1rem',
									px: 2,
									py: 1,
									borderRadius: 2,
									background: trendingSpecialty === cat ? '#e53935' : '#fff',
									color: trendingSpecialty === cat ? '#fff' : '#e53935',
									border: trendingSpecialty === cat ? 'none' : '1px solid #e53935',
									boxShadow: trendingSpecialty === cat ? '0 2px 8px rgba(229,57,53,0.10)' : 'none',
									cursor: 'pointer',
									transition: 'all 0.25s',
									mr: 0.5,
									mb: 1,
									'&:hover': {
										background: '#e53935',
										color: '#fff',
										boxShadow: '0 4px 16px rgba(229,57,53,0.18)'
									},
								}}
							/>
						))}
						{!showAllCategories && (
							<Button variant="outlined" size="small" sx={{ borderColor: '#e53935', color: '#e53935', fontWeight: 600, ml: 2, px: 2, py: 0.5, borderRadius: 2, transition: 'all 0.25s', boxShadow: '0 2px 8px rgba(229,57,53,0.10)', '&:hover': { background: '#e53935', color: '#fff', boxShadow: '0 4px 16px rgba(229,57,53,0.18)' } }} onClick={() => setShowAllCategories(true)}>
								View All Categories
							</Button>
						)}
					</Box>
				</Container>

				{/* NEARBY TRAINERS SECTION */}
				<Container maxWidth="lg" sx={{ mt: { xs: 10, md: 10 }, mb: { xs: 10, md: 10 } }}>
					<Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e53935', mb: 2, textAlign: 'center' }}>
						Nearby Trainers
					</Typography>
					<Grid container spacing={4} justifyContent="center">
						{mockTrainers.map(trainer => (
							<Grid item xs={12} sm={6} md={4} lg={3} key={trainer._id}>
								<Paper elevation={4} sx={{
									borderRadius: 4,
									overflow: 'hidden',
									cursor: 'pointer',
									transition: 'all 0.25s ease',
									boxShadow: '0 2px 12px rgba(229,57,53,0.10)',
									'&:hover': {
										boxShadow: '0 8px 32px rgba(229,57,53,0.18)',
										transform: 'translateY(-4px)'
									},
									p: 0,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									minHeight: 370,
								}} onClick={() => navigate(`/trainer/${trainer._id}`)}>
									<Avatar src={trainer.profilePicture} alt={trainer.user.name} sx={{ width: 100, height: 100, mt: 3, mb: 1, border: '3px solid #e53935', transition: 'all 0.25s' }} />
									<Box sx={{ px: 3, pb: 3, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.2 }}>
										<Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>{trainer.user.name}</Typography>
										<Typography variant="body2" sx={{ color: '#888' }}>{trainer.user.location}</Typography>
										<Typography variant="body2" sx={{ color: '#e53935', fontWeight: 500 }}>{trainer.specialties.join(', ')}</Typography>
										<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
											<StarIcon sx={{ color: '#FFD600', fontSize: 20, mr: 0.5 }} />
											<Typography variant="body2" sx={{ color: '#222', fontWeight: 600 }}>{trainer.rating.toFixed(1)}</Typography>
											<Typography variant="body2" sx={{ color: '#888', ml: 0.5 }}>({getReviewCount(trainer._id)} reviews)</Typography>
										</Box>
										<Typography variant="body2" sx={{ color: '#222', fontWeight: 500 }}>${trainer.pricePerSession}/session</Typography>
										<Button
											variant="contained"
											size="small"
											sx={{
												backgroundColor: '#e53935',
												color: '#fff',
												fontWeight: 600,
												borderRadius: 2,
												mt: 1,
												px: 3,
												py: 0.5,
												fontSize: '1rem',
												boxShadow: '0 2px 8px rgba(229,57,53,0.10)',
												transition: 'all 0.25s',
												'&:hover': { backgroundColor: '#b71c1c', boxShadow: '0 4px 16px rgba(229,57,53,0.18)' }
											}}
											onClick={e => { e.stopPropagation(); navigate(`/trainer/${trainer._id}`); }}
										>
											View Profile
										</Button>
									</Box>
								</Paper>
							</Grid>
						))}
					</Grid>
				</Container>

				{/* FOOTER */}
				{/* FOOTER POLISH */}
				<Box sx={{ background: '#222', color: '#fff', py: 5, mt: 10 }} component="footer">
					<Container maxWidth="lg">
						<Grid container spacing={4}>
							<Grid item xs={12} md={4}>
								<Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#fff' }}>LetsTrain</Typography>
								<Typography variant="body2" sx={{ color: '#ccc', mb: 2 }}>
									Find personal trainers and fitness classes across Lebanon.
								</Typography>
							</Grid>
							<Grid item xs={12} md={4}>
								<Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#fff' }}>Links</Typography>
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
									<Link href="/" sx={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
									<Link href="/classes" sx={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}>Explore Classes</Link>
									<Link href="/trainers" sx={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}>Find Trainers</Link>
									<Link href="/for-trainers" sx={{ color: '#fff', textDecoration: 'none', fontWeight: 500 }}>For Trainers</Link>
								</Box>
							</Grid>
							<Grid item xs={12} md={4}>
								<Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#fff' }}>Contact</Typography>
								<Typography variant="body2" sx={{ color: '#ccc', mb: 1 }}>hello@letstrain.com</Typography>
							</Grid>
						</Grid>
						<Divider sx={{ my: 4, borderColor: '#444' }} />
						<Typography variant="body2" sx={{ color: '#888', textAlign: 'center' }}>
							© LetsTrain 2025
						</Typography>
					</Container>
				</Box>
			</Box>
		</>
	);
};

export default HomePage;
