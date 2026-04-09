import Header from './Header';
import { useAuth } from './AuthContext';
import BookingModal from './BookingModal';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import PaperAirplaneIcon from '@mui/icons-material/Send';
import React, { useEffect, useState } from 'react';
// import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
	Container, Typography, Card, CardContent, Button, Grid, Avatar, Chip, Box, Paper, Stack, LinearProgress, Slider, TextField, Rating, Divider, IconButton, Collapse
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import MessageIcon from '@mui/icons-material/Message';

const metricLabels = [
	{ key: 'knowledge', label: 'Knowledge' },
	{ key: 'communication', label: 'Communication' },
	{ key: 'motivation', label: 'Motivation' },
	{ key: 'results', label: 'Results' },
];
const ratingLabels = {
	1: 'Poor',
	2: 'Fair',
	3: 'Good',
	4: 'Very Good',
	5: 'Excellent',
};

const TrainerProfile = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { id } = useParams();

	// State for login prompt dialog
	const [loginPromptOpen, setLoginPromptOpen] = useState(false);
	const [messageLoading, setMessageLoading] = useState(false);

	const handleMessageClick = async () => {
		if (!user) {
			setLoginPromptOpen(true);
			return;
		}
		if (!trainer || !trainer.user?._id) {
			console.error('Trainer or trainer.user._id missing', { trainer });
			alert('Trainer information not available');
			return;
		}

		setMessageLoading(true);
		try {
			const token = localStorage.getItem('token');
			
			// Create or get chat with trainer (pass trainer's user ID)
			const res = await axios.post(
				'http://localhost:5000/api/chats',
				{ trainerId: trainer.user._id },
				{ headers: { 'x-auth-token': token } }
			);
			
			console.log('Chat created/fetched successfully');
			const chatId = res.data._id;
			
			// Navigate directly to the chat
			navigate(`/messages/${chatId}`, { state: { from: '/trainers' } });
		} catch (err) {
			console.error('Error creating chat:', err);
			const errorMsg = err.response?.data?.msg || err.response?.data?.error || err.message || 'Unknown error';
			alert(`Failed to start chat: ${errorMsg}`);
			setMessageLoading(false);
		}
	};

	const handleLoginPromptClose = () => setLoginPromptOpen(false);

	const handleLoginRedirect = () => {
		setLoginPromptOpen(false);
		navigate(`/login?returnUrl=/trainer/${id}?message=1`);
	};

	const handleBookSession = () => {
		if (!user) {
			setLoginPromptOpen(true);
			return;
		}
		setBookingModalOpen(true);
	};

	const handleBookingModalClose = () => {
		setBookingModalOpen(false);
	};

	const [trainer, setTrainer] = useState(null);
	const [reviews, setReviews] = useState([]);
	const [averageMetrics, setAverageMetrics] = useState({ knowledge: 0, communication: 0, motivation: 0, results: 0 });
	const [showAddReview, setShowAddReview] = useState(false);
	const [reviewText, setReviewText] = useState('');
	const [reviewEmail, setReviewEmail] = useState('');
	const [reviewMetrics, setReviewMetrics] = useState({ knowledge: 0, communication: 0, motivation: 0, results: 0 });
	const [overallRating, setOverallRating] = useState(0);
	const [showDetails, setShowDetails] = useState(false);
	const [successDialogOpen, setSuccessDialogOpen] = useState(false);
	const [errorDialogOpen, setErrorDialogOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [bookingModalOpen, setBookingModalOpen] = useState(false);
	const [hover, setHover] = useState({
		knowledge: -1,
		communication: -1,
		motivation: -1,
		results: -1,
		overall: -1,
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get(`http://localhost:5000/api/trainers/${id}`);
				const trainerData = res.data?.trainer || res.data;
				setTrainer(trainerData);
				setReviews(res.data?.reviews || []);
				// Calculate averages
				const metrics = { knowledge: 0, communication: 0, motivation: 0, results: 0 };
				if (res.data?.reviews?.length) {
					res.data.reviews.forEach(r => {
						metricLabels.forEach(m => { metrics[m.key] += Number(r.metrics?.[m.key] || 0); });
					});
					metricLabels.forEach(m => { metrics[m.key] = (metrics[m.key] / res.data.reviews.length).toFixed(1); });
				}
				setAverageMetrics(metrics);
			} catch (err) {
				setTrainer(null);
			}
		};
		fetchData();
	}, [id]);

	const handleAddReview = () => setShowAddReview(true);
	const handleReviewChange = (metric, value) => setReviewMetrics(r => ({ ...r, [metric]: value }));
	const handleOverallChange = value => setOverallRating(value);
	const handleReviewSubmit = async (e) => {
		e.preventDefault();
		const token = localStorage.getItem('token');
		
		if (!overallRating) {
			setErrorMessage('Please provide an overall rating');
			setErrorDialogOpen(true);
			return;
		}
		
		try {
			const reviewData = {
				rating: overallRating,
				comment: reviewText,
				metrics: reviewMetrics
			};
			
			const res = await axios.post(
				`http://localhost:5000/api/trainers/${id}/reviews`,
				reviewData,
				{ headers: { 'x-auth-token': token } }
			);
			
			console.log('Review submitted:', res.data);
			
			// Add new review to the list
			setReviews(prev => [...prev, res.data]);
			
			// Clear form
			setShowAddReview(false);
			setReviewText('');
			setReviewEmail('');
			setReviewMetrics({ knowledge: 0, communication: 0, motivation: 0, results: 0 });
			setOverallRating(0);
			setShowDetails(false);
			
			// Show success dialog
			setSuccessDialogOpen(true);
			
			// Refetch trainer data to get updated rating
			const trainerRes = await axios.get(`http://localhost:5000/api/trainers/${id}`);
			const trainerData = trainerRes.data?.trainer || trainerRes.data;
			console.log('Updated trainer data:', trainerData);
			setTrainer(trainerData);
		} catch (err) {
			console.error('Error submitting review:', err);
			const errorMsg = err.response?.data?.msg || err.message || 'Failed to submit review';
			setErrorMessage(errorMsg);
			setErrorDialogOpen(true);
		}
	};

	if (!trainer) return <Container sx={{ mt: 8 }}><Typography>Loading...</Typography></Container>;

	// Placeholder stats (replace with real data if available)
	const clientsTrained = trainer.clientsTrained || 0;
	const sessionsCompleted = trainer.sessionsCompleted || 0;
	const certificates = trainer.certificates || [];
	const specialties = trainer.specialties || [];
	const experience = trainer.experience || 0;
	const price = trainer.pricePerSession || 0;
	const location = trainer.user?.location || trainer.location || 'Unknown';
	const name = trainer.user?.name || trainer.name || 'Trainer';
	const profilePicture = trainer.profilePicture || '';
	const bio = trainer.bio || '';

	return (
		<>
			<Header />
			<Box sx={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #f3f4f6 100%)', minHeight: '100vh', py: 4 }}>
				<Container maxWidth="xl">

					{/* ===== HERO SECTION: 3-COLUMN LAYOUT ===== */}
					<Box 
						sx={{ 
							mb: 6,
							p: { xs: 4, sm: 5 },
							background: '#fff',
							borderRadius: 3,
							boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
							border: '1px solid #f0f0f0'
						}}
					>
						<Grid container spacing={{ xs: 2.5, sm: 3 }} alignItems="center">
							{/* LEFT: Avatar + Basic Info */}
					<Grid item xs={12} sm="auto" sx={{ display: 'flex', gap: { xs: 2, sm: 2.5 }, alignItems: { xs: 'center', sm: 'flex-start' } }}>
						<Avatar 
							src={profilePicture} 
							sx={{ 
								width: 80, 
								height: 80,
								boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
								flexShrink: 0
							}} 
						/>
						<Box sx={{ textAlign: { xs: 'center', sm: 'left' }, minWidth: 0 }}>
							<Typography variant="h5" sx={{ fontWeight: 700, mb: 0.75, fontSize: { xs: 20, sm: 24 }, color: '#1a1a1a' }}>
								{name}
							</Typography>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
								<LocationOnIcon sx={{ fontSize: 14, color: '#999' }} />
								<Typography variant="caption" sx={{ color: '#666', fontSize: 13 }}>{location}</Typography>
							</Box>
							{/* Rating Stars */}
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
								<Box sx={{ display: 'flex', gap: 0.1 }}>
									{[...Array(5)].map((_, i) => {
										const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;
										return <StarIcon key={i} sx={{ color: i < Math.round(avgRating) ? '#ffc107' : '#e0e0e0', fontSize: 14 }} />;
									})}
								</Box>
								<Typography variant="body2" sx={{ fontWeight: 600, color: '#333', fontSize: 13 }}>
									{reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 'N/A'}
								</Typography>
								<Typography variant="caption" sx={{ color: '#999', fontSize: 12 }}>
									({reviews.length})
								</Typography>
						</Box>
					</Box>
				</Grid>

				{/* CENTER: Stats Grid */}
					<Grid item xs={12} sm="auto">
								<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, textAlign: 'center' }}>
									<Box sx={{ px: 2, py: 1, borderRight: '1px solid #f0f0f0', '&:last-child': { borderRight: 'none' } }}>
										<Typography variant="h6" sx={{ fontWeight: 700, color: '#e53935', mb: 0.5, fontSize: 20 }}>{clientsTrained}</Typography>
										<Typography variant="caption" sx={{ color: '#999', fontSize: 11, fontWeight: 500 }}>Clients</Typography>
									</Box>
									<Box sx={{ px: 2, py: 1, borderRight: '1px solid #f0f0f0' }}>
										<Typography variant="h6" sx={{ fontWeight: 700, color: '#e53935', mb: 0.5, fontSize: 20 }}>{sessionsCompleted}</Typography>
										<Typography variant="caption" sx={{ color: '#999', fontSize: 11, fontWeight: 500 }}>Sessions</Typography>
									</Box>
									<Box sx={{ px: 2, py: 1 }}>
										<Typography variant="h6" sx={{ fontWeight: 700, color: '#e53935', mb: 0.5, fontSize: 20 }}>{experience}</Typography>
										<Typography variant="caption" sx={{ color: '#999', fontSize: 11, fontWeight: 500 }}>Yrs</Typography>
            </Box>
        </Box>				</Grid>

				{/* RIGHT: Price + Actions */}							<Grid item xs={12} sm="auto">
								<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'stretch', sm: 'flex-end' }, gap: 1.5 }}>
									<Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
										<Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0 }}>$</Typography>
										<Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: 22, mb: 0.25 }}>
											{price}
										</Typography>
										<Typography variant="caption" sx={{ color: '#999', fontSize: 12 }}>per session</Typography>
									</Box>
									<Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
										<Button 
											variant="contained" 
											onClick={handleBookSession}
											sx={{ 
												py: 1,
												px: 2.5,
												fontWeight: 600,
												fontSize: 13,
												borderRadius: 2,
												background: '#e53935',
												color: '#fff',
												boxShadow: '0 2px 6px rgba(229, 57, 53, 0.2)',
												flexGrow: 1,
												'&:hover': { 
													background: '#c62828',
													boxShadow: '0 3px 10px rgba(229, 57, 53, 0.25)'
												}
											}}
										>
											Book
										</Button>
										<Button 
											variant="outlined" 
											onClick={handleMessageClick}
											disabled={messageLoading}
											startIcon={messageLoading ? <CircularProgress size={14} sx={{ color: '#e53935' }} /> : <MessageIcon sx={{ fontSize: 18 }} />}
											sx={{ 
												py: 1,
												px: 2.5,
												fontWeight: 600,
												fontSize: 13,
												borderRadius: 2,
												color: '#e53935',
												borderColor: '#e53935',
												flexGrow: 1,
												'&:hover': { 
													background: 'rgba(229, 57, 53, 0.05)',
													borderColor: '#c62828',
													color: '#c62828'
												}
											}}
										>
											{messageLoading ? 'Starting...' : 'Message'}
										</Button>
									</Box>
								</Box>
							</Grid>
						</Grid>
					</Box>

					{/* ===== CONTENT SECTIONS ===== */}
					<Grid container spacing={3}>
					{/* LEFT: About + Specialties + Certifications */}
					<Grid item xs={12} md={8}>
						<Grid container spacing={3}>
							{/* About */}
							<Grid item xs={12}>
								<Box 
									sx={{ 
										p: 3,
										background: '#fff',
										borderRadius: 2,
										boxShadow: '0 1px 4px rgba(0, 0, 0, 0.09)',
										border: '1px solid #f5f5f5',
										transition: 'all 0.3s ease',
										'&:hover': {
											boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
											borderColor: '#f0f0f0'
										}
									}}
								>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
										<Box sx={{ width: 4, height: 24, background: '#e53935', borderRadius: 1 }} />
										<Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', m: 0 }}>About</Typography>
									</Box>
									<Typography variant="body2" sx={{ color: '#555', lineHeight: 1.8, fontSize: 13 }}>
										{bio || 'No bio provided.'}
									</Typography>
								</Box>
							</Grid>

							{/* Specialties + Certifications: Side by Side */}
							<Grid item xs={12}>
								<Grid container spacing={2.5}>
								{/* Specialties */}
								{specialties.length > 0 && (
									<Grid item xs={12} sm={6}>
										<Box 
											sx={{ 
												p: 3,
												background: '#fff',
												borderRadius: 2,
												boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
												height: '100%'
											}}
										>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
													<Box sx={{ width: 4, height: 24, background: '#e53935', borderRadius: 1 }} />
													<Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', m: 0 }}>Specialties</Typography>
												</Box>
										<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
											{specialties.map((spec, i) => (
												<Chip 
													key={i} 
													label={spec} 
													sx={{ 
														fontSize: 12,
														height: 26,
															background: '#f0f0f0',
															color: '#333',
															fontWeight: 500,
															'&:hover': { background: '#e8e8e8' }
														}} 
													/>
												))}
											</Box>
										</Box>
									</Grid>
								)}

								{/* Certifications */}
								{certificates.length > 0 && (
									<Grid item xs={12} sm={specialties.length > 0 ? 6 : 12}>
										<Box 
											sx={{ 
												p: 3,
												background: '#fff',
												borderRadius: 2,
												boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
												height: '100%'
											}}
										>
															<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
																<Box sx={{ width: 4, height: 24, background: '#e53935', borderRadius: 1 }} />
																<Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', m: 0 }}>Certifications</Typography>
															</Box>
											<Stack spacing={1}>
												{certificates.map((cert, i) => (
													<Box 
														key={i}
														sx={{ 
															p: 1.25,
															display: 'flex',
															alignItems: 'center',
															background: '#f8f9fa',
															borderRadius: 1.5,
															border: '1px solid #eee'
														}}
													>
														<Box sx={{ color: '#e53935', mr: 1, fontWeight: 700, fontSize: 14 }}>✓</Box>
														<Typography variant="body2" sx={{ fontWeight: 500, color: '#333', fontSize: 13 }}>{cert}</Typography>
													</Box>
												))}
											</Stack>
										</Box>
									</Grid>
								)}
							</Grid>
						</Grid>
					</Grid>
				</Grid>

				{/* RIGHT: Client Ratings Metrics */}
					{Object.values(averageMetrics).some(v => v > 0) && (
						<Grid item xs={12} md={4}>
							<Box 
								sx={{ 
									p: 3,
									background: '#fff',
									borderRadius: 2,
									boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
								}}
							>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
									<Box sx={{ width: 4, height: 24, background: '#e53935', borderRadius: 1 }} />
									<Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', m: 0 }}>Client Ratings</Typography>
								</Box>
								<Stack spacing={2}>
									{metricLabels.map(m => (
										<Box key={m.key}>
											<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
												<Typography variant="body2" sx={{ fontWeight: 500, color: '#666', fontSize: 12 }}>{m.label}</Typography>
												<Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: 13 }}>
													{(Number(averageMetrics[m.key] || 0)).toFixed(1)}/5
												</Typography>
											</Box>
											<Box sx={{ height: 5, background: '#e8e8e8', borderRadius: 10, overflow: 'hidden' }}>
												<Box 
													sx={{ 
														height: '100%',
														background: '#e53935',
														width: `${(Number(averageMetrics[m.key] || 0) / 5) * 100}%`,
														transition: 'width 0.4s ease',
														borderRadius: 10
													}} 
												/>
											</Box>
										</Box>
									))}
								</Stack>
							</Box>
						</Grid>
					)}

					{/* Reviews Section - Full Width */}
					<Grid item xs={12}>
							<Box 
								sx={{ 
									p: 3,
									background: '#fff',
									borderRadius: 2,
									boxShadow: '0 1px 4px rgba(0, 0, 0, 0.09)',
									border: '1px solid #f5f5f5'
								}}
							>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Box sx={{ width: 4, height: 24, background: '#e53935', borderRadius: 1 }} />
										<Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', m: 0 }}>
											Reviews {reviews.length > 0 && `(${reviews.length})`}
										</Typography>
									</Box>
									{!showAddReview && (
										<Button 
											variant="contained"
											onClick={handleAddReview}
											sx={{ 
												background: '#e53935',
												color: '#fff',
												fontWeight: 600,
												fontSize: 13,
												borderRadius: 2,
												px: 2,
												py: 0.75,
												'&:hover': { background: '#c62828' }
											}}
										>
											Leave Review
										</Button>
									)}
								</Box>

								{reviews.length === 0 && !showAddReview && (
									<Box sx={{ textAlign: 'center', py: 4 }}>
										<Typography variant="body2" sx={{ color: '#999', mb: 2 }}>
											No reviews yet. Be the first to share your experience!
										</Typography>
										<Button 
											variant="contained"
											onClick={handleAddReview}
											sx={{ 
												background: '#e53935',
												color: '#fff',
												fontWeight: 600,
												'&:hover': { background: '#c62828' }
											}}
										>
											Write a Review
										</Button>
									</Box>
								)}

								{showAddReview && (
									<Box sx={{ mb: 3, p: 3, background: '#f8f9fa', borderRadius: 2, border: '1px solid #eee' }}>
										<form onSubmit={handleReviewSubmit}>
											<Stack spacing={2}>
												<Box>
													<Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#1a1a1a' }}>
														Overall Rating <span style={{ color: '#e53935' }}>*</span>
													</Typography>
													<Rating
														value={overallRating || 0}
														size="large"
														onChange={(_, value) => handleOverallChange(value)}
													/>
												</Box>
												<TextField 
													label="Your feedback" 
													multiline 
													rows={3}
													value={reviewText} 
													onChange={e => setReviewText(e.target.value)}
													fullWidth
													variant="outlined"
													sx={{
														'& .MuiOutlinedInput-root': {
															borderRadius: 1.5,
															fontSize: 14
														}
													}}
												/>
												<Box>
													<Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#1a1a1a' }}>Rate specific areas (optional)</Typography>
													<Grid container spacing={2}>
														{metricLabels.map(m => (
															<Grid item xs={6} sm={3} key={m.key}>
																<Box>
																	<Typography variant="caption" sx={{ fontWeight: 500, color: '#666', display: 'block', mb: 1 }}>{m.label}</Typography>
																	<Rating
																		name={m.key}
																		value={reviewMetrics[m.key] || 0}
																		onChange={(_, value) => handleReviewChange(m.key, value)}
																		size="small"
																	/>
																</Box>
															</Grid>
														))}
													</Grid>
												</Box>
												<Button 
													type="submit" 
													variant="contained"
													fullWidth
													sx={{ 
														background: '#e53935',
														color: '#fff',
														fontWeight: 600,
														py: 1,
														borderRadius: 2,
														'&:hover': { background: '#c62828' }
													}}
												>
													Submit Review
												</Button>
											</Stack>
										</form>
									</Box>
								)}

								{/* Review Cards */}
								{reviews.length > 0 && (
									<Stack spacing={2}>
										{reviews.map((review, idx) => (
											<Box 
												key={idx}
												sx={{ 
													p: 3,
													background: '#fff',
													borderRadius: 2,
													border: '1px solid #f0f0f0',
													transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
													'&:hover': {
														boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
														borderColor: '#e0e0e0',
														transform: 'translateY(-2px)'
													}
												}}
											>
												{/* Testimonial Header */}
												<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 2 }}>
													<Box sx={{ display: 'flex', gap: 1.5, flex: 1 }}>
														<Avatar 
															src={review.client?.profilePicture} 
															alt={review.client?.name}
															sx={{ width: 32, height: 32 }}
														/>
														<Box>
															<Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
																{review.client?.name || 'Anonymous'}
															</Typography>
															<Typography variant="caption" sx={{ color: '#999' }}>
																{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
															</Typography>
														</Box>
													</Box>
													<Box sx={{ display: 'flex', gap: 0.2 }}>
														{[...Array(5)].map((_, i) => (
															<StarIcon 
																key={i} 
																sx={{ 
																	color: i < review.rating ? '#ffc107' : '#e0e0e0', 
																	fontSize: 14 
																}} 
															/>
														))}
													</Box>
												</Box>

												{/* Comment */}
												<Typography variant="body2" sx={{ color: '#555', lineHeight: 1.7, mb: 1.5 }}>
													"{review.comment}"
												</Typography>

												{/* Metrics Grid (if any) */}
												{review.metrics && Object.values(review.metrics).some(v => v > 0) && (
													<Box sx={{ pt: 1.5, borderTop: '1px solid #e0e0e0' }}>
														<Grid container spacing={1.5} sx={{ mt: 0 }}>
															{metricLabels.map(m => 
																review.metrics?.[m.key] > 0 ? (
																	<Grid item xs={6} sm={3} key={m.key}>
																		<Box>
																			<Typography variant="caption" sx={{ color: '#999', fontWeight: 500, display: 'block', mb: 0.5 }}>
																				{m.label}
																			</Typography>
																			<Box sx={{ display: 'flex', gap: 0.1 }}>
																				{[...Array(5)].map((_, i) => (
																					<StarIcon 
																						key={i} 
																						sx={{ 
																							color: i < review.metrics[m.key] ? '#e53935' : '#e0e0e0', 
																							fontSize: 10 
																						}} 
																					/>
																				))}
																			</Box>
																		</Box>
																	</Grid>
																) : null
															)}
														</Grid>
													</Box>
												)}
											</Box>
										))}
									</Stack>
								)}
							</Box>
						</Grid>
					</Grid>
			</Container>
			</Box>
			<Dialog open={loginPromptOpen} onClose={handleLoginPromptClose} PaperProps={{ sx: { borderRadius: 3, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)' } }}>
				<DialogTitle sx={{ background: '#fff', color: '#1a1a1a', fontWeight: 700, fontSize: 16, pb: 1.5 }}>Please log in to message this trainer</DialogTitle>
				<DialogContent sx={{ px: 3, py: 2.5, background: '#fff', fontSize: 14, color: '#666' }}>
					You need to sign in to start a conversation. This only takes a few seconds!
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2.5, background: '#fff', gap: 1.5 }}>
					<Button onClick={handleLoginPromptClose} sx={{ color: '#666', fontWeight: 500, borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
					<Button onClick={handleLoginRedirect} variant="contained" sx={{ background: '#e53935', color: '#fff', fontWeight: 600, borderRadius: 2, textTransform: 'none', '&:hover': { background: '#c62828' } }}>Sign In</Button>
				</DialogActions>
			</Dialog>

			{/* Success Dialog */}
			<Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, minWidth: 360, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)' } }}>
				<DialogTitle sx={{ background: '#fff', color: '#1a1a1a', fontWeight: 700, fontSize: 18, textAlign: 'center', pb: 1 }}>
					✨ Review Posted!
				</DialogTitle>
				<DialogContent sx={{ textAlign: 'center', pt: 2, pb: 3, background: '#fff' }}>
					<Typography sx={{ fontSize: 14, color: '#666', mb: 1 }}>
						Thank you for sharing your feedback!
					</Typography>
					<Typography sx={{ fontSize: 13, color: '#999' }}>
						Your review helps other clients learn about this trainer's expertise.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ pb: 2.5, px: 3, justifyContent: 'center', background: '#fff' }}>
					<Button 
						onClick={() => setSuccessDialogOpen(false)} 
						variant="contained" 
						sx={{ background: '#e53935', color: '#fff', fontWeight: 600, borderRadius: 2, px: 3, textTransform: 'none', '&:hover': { background: '#c62828' } }}
					>
						Awesome!
					</Button>
				</DialogActions>
			</Dialog>

			{/* Error Dialog */}
			<Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, minWidth: 360, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)' } }}>
				<DialogTitle sx={{ background: '#fff', color: '#1a1a1a', fontWeight: 700, fontSize: 18, textAlign: 'center', pb: 1 }}>
					⚠️ Something went wrong
				</DialogTitle>
				<DialogContent sx={{ textAlign: 'center', pt: 2, pb: 3, background: '#fff' }}>
					<Typography sx={{ fontSize: 14, color: '#666' }}>
						{errorMessage}
					</Typography>
				</DialogContent>
				<DialogActions sx={{ pb: 2.5, px: 3, justifyContent: 'center', background: '#fff' }}>
					<Button 
						onClick={() => setErrorDialogOpen(false)} 
						variant="contained" 
						sx={{ background: '#e53935', color: '#fff', fontWeight: 600, borderRadius: 2, px: 3, textTransform: 'none', '&:hover': { background: '#c62828' } }}
					>
						Got it
					</Button>
				</DialogActions>
			</Dialog>

			{/* Booking Modal */}
			{trainer && (
				<BookingModal 
					open={bookingModalOpen}
					onClose={handleBookingModalClose}
					trainer={trainer}
					trainerUser={trainer.user}
				/>
			)}
		</>
	);
};

export default TrainerProfile;
