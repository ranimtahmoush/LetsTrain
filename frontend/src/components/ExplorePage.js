import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Container, Box, Typography, Grid, Paper, Button, TextField, Select, MenuItem, FormControl, Card, CardContent, CardMedia, Chip, useMediaQuery, Modal, Divider, Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import SearchIcon from '@mui/icons-material/Search';
import Header from './Header';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const locations = [
	'Lebanon', 'Beirut', 'Tripoli', 'Tyre', 'Sidon', 'Jounieh'
];
const gyms = [
	'FitZone', 'PowerHouse', 'Iron Gym', 'BodyLab', 'Anytime Fitness', 'Golds Gym'
];
const classCategories = [
	{ label: 'Weight Loss', icon: '🔥' },
	{ label: 'Strength Training', icon: '💪' },
	{ label: 'Yoga', icon: '🧘' },
	{ label: 'Meditation', icon: '🧘‍♂️' },
	{ label: 'Boxing', icon: '🥊' },
	{ label: 'HIIT', icon: '🏃' },
	{ label: 'Pilates', icon: '🤸' },
	{ label: 'Rehabilitation', icon: '🦵' },
	{ label: 'Cardio', icon: '❤️' },
	{ label: 'CrossFit', icon: '🏋️' },
];

function formatClassDate(dateString) {
	if (!dateString) return '';
	const date = new Date(dateString);
	return date.toLocaleString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
	});
}

const ExplorePage = () => {
	const navigate = useNavigate();
	const [filters, setFilters] = useState({
		location: '',
		category: '',
		date: '',
		time: '',
		gym: '',
	});
	const [activeCategory, setActiveCategory] = useState('');
	const isMobile = useMediaQuery('(max-width:600px)');
	const [classes, setClasses] = useState([]);
	const [selectedClass, setSelectedClass] = useState(null);

	useEffect(() => {
		const fetchClasses = async () => {
			try {
				const res = await fetch('http://localhost:5000/api/classes');
				const data = await res.json();
				// Ensure data is an array, default to empty array if not
				setClasses(Array.isArray(data) ? data : []);
			} catch (err) {
				console.error('Failed to fetch classes:', err);
				setClasses([]);
			}
		};
		fetchClasses();
	}, []);

	const handleFilterChange = (field, value) => {
		setFilters((prev) => ({ ...prev, [field]: value }));
		if (field === 'category') setActiveCategory(value);
	};
	const handleOpenClass = (cls) => setSelectedClass(cls);
	const handleCloseClass = () => setSelectedClass(null);

	const now = new Date();
	const filteredClasses = classes
		.filter(cls => new Date(cls.date) >= now && cls.status === 'active')
		.filter(cls =>
			(!filters.location || cls.location === filters.location) &&
			(!filters.category || cls.category === filters.category) &&
			(!filters.date || new Date(cls.date).toISOString().slice(0,10) === filters.date) &&
			(!filters.time || (cls.date && new Date(cls.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) === filters.time)) &&
			(!filters.gym || (cls.gym && cls.gym === filters.gym))
		);

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
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
				<Container maxWidth={false} sx={{ zIndex: 2, py: { xs: 5, md: 8 } }}>
					<Box sx={{ textAlign: 'center', color: '#fff', mb: 4 }}>
						<Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '2.4rem', sm: '3.5rem' }, mb: 1.5, letterSpacing: '-1px', lineHeight: 1.1 }}>
							Explore Classes
						</Typography>
						<Typography variant="h5" sx={{ fontWeight: 400, color: 'rgba(255,255,255,0.92)', mb: 2, fontSize: { xs: '1.1rem', sm: '1.35rem' } }}>
							Find and book your next group class
						</Typography>
					</Box>
					{/* SEARCH/FILTER BOX */}
					<Paper elevation={3} sx={{
						p: { xs: 2.5, sm: 3.5 },
						borderRadius: 3,
						maxWidth: '95%', // Allow box to fit all elements
						mx: 'auto',
						background: 'rgba(255,255,255,0.97)',
						display: 'flex',
						flexDirection: { xs: 'column', sm: 'row' },
						alignItems: 'center',
						flexWrap: 'nowrap',
						gap: 2,
						boxShadow: '0 2px 12px rgba(229,57,53,0.08)',
						transition: 'box-shadow 0.25s',
					}}>
						<TextField
							size="small"
							placeholder="Search classes..."
							value={filters.search || ''}
							onChange={(e) => handleFilterChange('search', e.target.value)}
							InputProps={{ startAdornment: <SearchIcon sx={{ color: '#e53935', mr: 1 }} /> }}
							sx={{ flex: 1.1, minWidth: 160 }}
						/>
						<TextField
							select
							size="small"
							label="Location"
							value={filters.location}
							onChange={(e) => handleFilterChange('location', e.target.value)}
							InputProps={{
								startAdornment: <LocationOnIcon sx={{ color: '#e53935', mr: 1, fontSize: 18 }} />
							}}
							sx={{ flex: 1.1, minWidth: 140 }}
						>
							<MenuItem value="">None</MenuItem>
							{locations.map((loc) => (
								<MenuItem key={loc} value={loc}>{loc}</MenuItem>
							))}
						</TextField>
						<TextField
							select
							size="small"
							label="Category"
							value={filters.category}
							onChange={(e) => handleFilterChange('category', e.target.value)}
							InputProps={{
								startAdornment: <LocalOfferIcon sx={{ color: '#e53935', mr: 1, fontSize: 18 }} />
							}}
							sx={{ flex: 1.1, minWidth: 140 }}
						>
							<MenuItem value="">None</MenuItem>
							{classCategories.map((cat) => (
								<MenuItem key={cat.label} value={cat.label}>{cat.label}</MenuItem>
							))}
						</TextField>
						<TextField
							select
							size="small"
							label="Gym"
							value={filters.gym}
							onChange={(e) => handleFilterChange('gym', e.target.value)}
							InputProps={{
								startAdornment: <FitnessCenterIcon sx={{ color: '#e53935', mr: 1, fontSize: 18 }} />
							}}
							sx={{ flex: 1, minWidth: 130 }}
						>
							<MenuItem value="">None</MenuItem>
							{gyms.map((gym) => (
								<MenuItem key={gym} value={gym}>{gym}</MenuItem>
							))}
						</TextField>
						<DatePicker
							label="Date"
							value={filters.date ? dayjs(filters.date) : null}
							onChange={(newDate) => {
								if (newDate) {
									handleFilterChange('date', newDate.format('YYYY-MM-DD'));
								} else {
									handleFilterChange('date', '');
								}
							}}
							slotProps={{
								textField: {
									size: 'small',
									sx: { 
										flex: 1.2, 
										minWidth: 160,
										'& .MuiOutlinedInput-input': {
											color: filters.date ? '#e53935' : 'inherit',
											fontWeight: filters.date ? 600 : 400
										}
									}
								},
								layout: {
									sx: {
										'& .MuiDateCalendar-root': {
											width: 320
										}
									}
								}
							}}
							sx={{
								'& .MuiOutlinedInput-root': {
									borderRadius: 1
								}
							}}
						/>
						<TimePicker
							label="Hour"
							value={filters.time ? dayjs(`2024-01-01 ${filters.time}`) : null}
							onChange={(newTime) => {
								if (newTime) {
									handleFilterChange('time', newTime.format('HH:mm'));
								} else {
									handleFilterChange('time', '');
								}
							}}
							slotProps={{
								textField: {
									size: 'small',
									sx: { 
										flex: 0.9, 
										minWidth: 110,
										'& .MuiOutlinedInput-input': {
											color: filters.time ? '#e53935' : 'inherit',
											fontWeight: filters.time ? 600 : 400
										}
									}
								}
							}}
						/>
					</Paper>
				</Container>
			</Box>
			<Box
				sx={{
					minHeight: '100vh',
					pt: 2,
					background: 'none',
				}}
			>
				<Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
					{/* Quick Category Buttons */}
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 3 }}>
						{classCategories.map((cat) => (
							<Chip
								key={cat.label}
								label={<span style={{ fontSize: '1rem', fontWeight: 500 }}>{cat.icon} {cat.label}</span>}
								color={activeCategory === cat.label ? 'error' : 'default'}
								variant={activeCategory === cat.label ? 'filled' : 'outlined'}
								onClick={() => handleFilterChange('category', cat.label)}
								sx={{
									backgroundColor: activeCategory === cat.label ? '#e53935' : '#fff',
									color: activeCategory === cat.label ? '#fff' : '#e53935',
									borderColor: '#e53935',
									borderWidth: 2,
									borderRadius: 2,
									px: 2,
									py: 0.5,
									cursor: 'pointer',
									'&:hover': {
										backgroundColor: '#e53935',
										color: '#fff',
									},
								}}
							/>
						))}
					</Box>

					{/* Featured/Upcoming Classes Section */}
					<Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e53935', mb: 3, textAlign: 'center' }}>
						Upcoming Classes
					</Typography>
					<Grid container spacing={3}>
						{filteredClasses.length === 0 ? (
							<Grid item xs={12}>
								<Paper sx={{ p: 4, textAlign: 'center', color: '#888', background: '#fff' }}>
									<Typography variant="h6" sx={{ mb: 1 }}>
										No classes found.
									</Typography>
									<Typography variant="body2">
										Try adjusting your filters or check back later for new classes!
									</Typography>
								</Paper>
							</Grid>
						) : (
							filteredClasses.map((cls) => (
								<Grid item xs={12} sm={6} md={4} key={cls.id}>
									<Card
										sx={{
											borderRadius: 3,
											boxShadow: '0 4px 24px rgba(229,57,53,0.08)',
											transition: 'transform 0.2s, box-shadow 0.2s',
											cursor: 'pointer',
											'&:hover': {
												transform: 'translateY(-6px) scale(1.03)',
												boxShadow: '0 8px 32px rgba(229,57,53,0.16)',
											},
										}}
										onClick={() => handleOpenClass(cls)}
									>
										<CardMedia
											component="img"
											height="180"
											image={cls.image}
											alt={cls.title}
											sx={{ objectFit: 'cover' }}
										/>
										<CardContent>
											<Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
												{cls.title}
											</Typography>
											<Typography variant="body2" sx={{ color: '#e53935', fontWeight: 500, mb: 0.5 }}>
												{cls.category} • {cls.gym}
											</Typography>
											<Typography variant="body2" sx={{ color: '#555', mb: 0.5 }}>
												Trainer: {cls.trainer && typeof cls.trainer === 'object' ? cls.trainer.name : cls.trainer}
											</Typography>
											<Typography variant="body2" sx={{ color: '#555', mb: 0.5 }}>
												<LocationOnIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
												{cls.location}
											</Typography>
											<Typography variant="body2" sx={{ color: '#555', mb: 0.5 }}>
												<CalendarTodayIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
												{formatClassDate(cls.date)}
											</Typography>
											<Typography variant="body2" sx={{ color: '#888', mb: 0.5 }}>
												{cls.spotsLeft} spots left
											</Typography>
											<Typography variant="body2" sx={{ color: '#888', mb: 0.5 }}>
												{cls.price ? `$${cls.price}` : 'Free'} • ⭐ {cls.rating}
											</Typography>
											<Button
												variant="contained"
												color="error"
												fullWidth
												sx={{ mt: 1, fontWeight: 'bold', borderRadius: 2 }}
											>
												Book Spot
											</Button>
										</CardContent>
									</Card>
								</Grid>
							))
						)}
					</Grid>
					{/* Modal for class details */}
					<Modal open={!!selectedClass} onClose={handleCloseClass} aria-labelledby="class-details-modal" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<Box sx={{ bgcolor: '#fff', borderRadius: 4, boxShadow: 24, p: 4, minWidth: 340, maxWidth: 420, outline: 'none' }}>
							{selectedClass && (
								<>
									<img src={selectedClass.image} alt={selectedClass.title} style={{ width: '100%', borderRadius: 8, marginBottom: 16, objectFit: 'cover', maxHeight: 180 }} />
									<Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#e53935' }}>{selectedClass.title}</Typography>
									<Typography variant="subtitle1" sx={{ mb: 1 }}>{selectedClass.category} • {selectedClass.gym}</Typography>
									<Divider sx={{ mb: 2 }} />
									<Stack spacing={1}>
										<Typography variant="body2"><b>Trainer:</b> {selectedClass.trainer && typeof selectedClass.trainer === 'object' ? selectedClass.trainer.name : selectedClass.trainer}</Typography>
										<Typography variant="body2"><b>Location:</b> {selectedClass.location}</Typography>
										<Typography variant="body2"><b>Date & Time:</b> {formatClassDate(selectedClass.date)}</Typography>
										<Typography variant="body2"><b>Spots Left:</b> {selectedClass.spotsLeft}</Typography>
										<Typography variant="body2"><b>Price:</b> {selectedClass.price ? `$${selectedClass.price}` : 'Free'}</Typography>
										<Typography variant="body2"><b>Rating:</b> ⭐ {selectedClass.rating}</Typography>
										{selectedClass.description && <Typography variant="body2" sx={{ mt: 1 }}><b>Description:</b> {selectedClass.description}</Typography>}
									</Stack>
									<Divider sx={{ my: 2 }} />
									<Button variant="contained" sx={{ background: '#e53935', color: '#fff', fontWeight: 'bold', borderRadius: 2, mb: 1 }} fullWidth>
										Book Spot
									</Button>
									<Button variant="outlined" sx={{ color: '#e53935', borderColor: '#e53935', fontWeight: 'bold', borderRadius: 2 }} fullWidth>
										DM Trainer
									</Button>
								</>
							)}
						</Box>
					</Modal>
				</Container>
			</Box>
			</>
		</LocalizationProvider>
	);
};

export default ExplorePage;
