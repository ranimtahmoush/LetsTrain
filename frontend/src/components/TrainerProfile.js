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
	const email = trainer.user?.email || '';
	const instagram = trainer.user?.instagram || '';
	const tiktok = trainer.user?.tiktok || '';
	const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;

	return (
		<>
			<Header />
			<Box sx={{ background: '#f8f9fa', minHeight: '100vh' }}>
				{/* HERO SECTION - Premium 2-Column Layout */}
				<Box 
					sx={{ 
						background: `linear-gradient(135deg, rgba(0,0,0,0.72), rgba(0,0,0,0.72)), url('/gym-bg.jpg') center/cover no-repeat`,
						backgroundAttachment: 'fixed',
						minHeight: { xs: 'auto', md: 550 },
						display: 'flex',
						alignItems: 'center',
						position: 'relative',
						py: { xs: 4, md: 6 },
						px: { xs: 2, md: 0 }
					}}
				>
					<Container maxWidth="lg" sx={{ zIndex: 2, width: '100%' }}>
					<Grid container spacing={{ xs: 2, md: 4 }} sx={{ alignItems: 'flex-start' }}>
							{/* LEFT COLUMN: Trainer Identity */}
							<Grid item xs={12} md={6}>
								<Box sx={{ color: '#fff' }}>
									{/* Avatar + Basic Info */}
						<Box sx={{ display: 'flex', gap: 2, mb: 1.25, alignItems: 'flex-start' }}>
									<Avatar 
										src={profilePicture} 
										sx={{ 
											width: { xs: 80, md: 100 }, 
											height: { xs: 80, md: 100 },
											boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
											border: '4px solid #fff',
											flexShrink: 0
										}} 
									/>
									<Box sx={{ flex: 1 }}>
									<Typography sx={{ fontWeight: 800, fontSize: { xs: 24, md: 32 }, color: '#fff', lineHeight: 1.1, mb: 0.5 }}>
										{name}
									</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
											<Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.95)' }}>
													{location}
												</Typography>
											</Box>
											{/* Inline Stats + Rating */}
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
												<Box sx={{ display: 'flex', gap: 0.2 }}>
													{[...Array(5)].map((_, i) => (
														<StarIcon key={i} sx={{ color: i < Math.round(avgRating) ? '#ffc107' : 'rgba(255,255,255,0.25)', fontSize: 16 }} />
													))}
												</Box>
												<Typography sx={{ fontWeight: 600, color: '#fff', fontSize: 13 }}>
													{avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
												</Typography>
												<Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
													({reviews.length})
												</Typography>

											</Box>
										</Box>
									</Box>

									{/* Specialties */}
									{specialties.length > 0 && (
										<Box sx={{ mt: 1 }}>
											<Typography sx={{ fontSize: 12, color: '#444', fontWeight: 800, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
												✨ Specialties
											</Typography>
											<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
												{specialties.map((spec, i) => (
													<Chip
														key={i}
														label={spec}
														sx={{
															background: '#fce4ec',
															color: '#ad1457',
															fontWeight: 700,
															fontSize: 12,
															height: 28,
															borderRadius: 2,
															boxShadow: '0 2px 6px rgba(173, 20, 87, 0.2)',
															'& .MuiChip-label': { px: 1 }
														}}
													/>
												))}
											</Box>
										</Box>
									)}
								</Box>
							</Grid>

							{/* RIGHT COLUMN: Premium Booking Card */}
							<Grid item xs={12} md={6}>
								<Box 
									sx={{ 
										background: '#fff',
										borderRadius: 3,
									p: 3,
									boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
									height: '100%',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'space-between',
									position: 'sticky',
									top: 100,
									border: '1px solid rgba(0,0,0,0.06)'
								}}
							>
								{/* Price Section */}
							<Box sx={{ mb: 2.5, textAlign: 'center', pb: 2.5, borderBottom: '2px solid #f0f0f0' }}>
								<Typography sx={{ fontSize: 9, color: '#aaa', fontWeight: 800, letterSpacing: 1, mb: 0.75, textTransform: 'uppercase' }}>
									per session
								</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25 }}>
									<Typography sx={{ fontSize: 22, color: '#999', fontWeight: 600 }}>$</Typography>
								<Typography sx={{ fontSize: 64, fontWeight: 900, color: '#e53935', lineHeight: 0.95, letterSpacing: -2 }}>
									{price}
								</Typography>
							</Box>
								</Box>

								{/* CTA Buttons */}
							<Stack spacing={1.15} sx={{ mb: 2 }}>
									<Button 
										variant="contained" 
										onClick={handleBookSession}
										fullWidth
										sx={{ 
											py: 1.4,
											fontWeight: 700,
											fontSize: 15,
											borderRadius: 2,
											background: 'linear-gradient(135deg, #e53935 0%, #d32f2f 100%)',
												color: '#fff',
												boxShadow: '0 8px 24px rgba(229, 57, 53, 0.35)',
												transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
												textTransform: 'none',
												'&:hover': { 
													background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
													boxShadow: '0 12px 32px rgba(229, 57, 53, 0.45)',
													transform: 'translateY(-2px)'
												}
											}}
										>
											Book Session
										</Button>
										<Button 
											variant="outlined" 
											onClick={handleMessageClick}
											disabled={messageLoading}
											startIcon={<MessageIcon sx={{ fontSize: 18 }} />}
											fullWidth
											sx={{ 
											py: 1.4,
											fontWeight: 700,
											fontSize: 15,
												borderRadius: 2,
												color: '#e53935',
												borderColor: '#e53935',
												border: '2px solid',
												transition: 'all 0.25s ease',
												textTransform: 'none',
												'&:hover': { 
													background: 'rgba(229, 57, 53, 0.08)',
													borderColor: '#d32f2f',
													color: '#d32f2f',
													boxShadow: '0 6px 16px rgba(229, 57, 53, 0.2)'
												}
											}}
										>
											{messageLoading ? 'Sending...' : 'Send Message'}
										</Button>
									</Stack>

									{/* Trust Note */}
									<Box sx={{ background: 'rgba(229, 57, 53, 0.05)', p: 1.5, borderRadius: 1.5, textAlign: 'center' }}>
										<Typography sx={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
											⏱️ Usually responds within 24 hours
										</Typography>
									</Box>
								</Box>
							</Grid>
						</Grid>
					</Container>
				</Box>

				{/* MAIN CONTENT - Premium Sections */}
			<Box sx={{ background: '#f8f9fa', py: { xs: 5, md: 6 } }}>
					<Container maxWidth="md">
						{/* ABOUT SECTION */}
						{bio && (
							<Box sx={{ mb: 3.5 }}>
								<Typography sx={{ fontWeight: 800, fontSize: { xs: 22, md: 26 }, color: '#1a1a1a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
									<span style={{ fontSize: '24px' }}>📝</span> About
								</Typography>
								<Box sx={{ background: '#fff', p: 3, borderRadius: 3, border: '1px solid #ddd', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
									<Typography sx={{ fontSize: 16, lineHeight: 1.75, color: '#555', textAlign: 'left' }}>
										{bio}
									</Typography>
								</Box>
							</Box>
						)}

						{/* STATS GRID */}
						<Box sx={{ mb: 2.75, p: 3, background: '#fff', borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
						<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
							<Box sx={{ display: 'flex', gap: 0.4, alignItems: 'baseline' }}>
								<Typography sx={{ fontSize: 32, fontWeight: 900, color: '#e53935' }}>
									{experience}
								</Typography>
								<Typography sx={{ fontSize: 12, color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.2 }}>
									yrs
								</Typography>
							</Box>
							<Box sx={{ width: '1px', height: 18, background: '#e0e0e0' }} />
							<Box sx={{ display: 'flex', gap: 0.4, alignItems: 'baseline' }}>
								<Typography sx={{ fontSize: 32, fontWeight: 900, color: '#e53935' }}>
									{clientsTrained}
								</Typography>
								<Typography sx={{ fontSize: 12, color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.2 }}>
									clients
								</Typography>
							</Box>
							<Box sx={{ width: '1px', height: 18, background: '#e0e0e0' }} />
							<Box sx={{ display: 'flex', gap: 0.4, alignItems: 'baseline' }}>
								<Typography sx={{ fontSize: 32, fontWeight: 900, color: '#e53935' }}>
									{sessionsCompleted}
								</Typography>
								<Typography sx={{ fontSize: 12, color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.2 }}>
									sessions
								</Typography>
							</Box>
							<Box sx={{ width: '1px', height: 18, background: '#e0e0e0' }} />
							<Box sx={{ display: 'flex', gap: 0.35, alignItems: 'center' }}>
								<Box sx={{ display: 'flex', gap: 0.15 }}>
									{[...Array(5)].map((_, i) => (
										<StarIcon key={i} sx={{ color: i < Math.round(avgRating) ? '#ffc107' : '#e0e0e0', fontSize: 15 }} />
									))}
								</Box>
								<Typography sx={{ fontSize: 15, fontWeight: 800, color: '#e53935', ml: 0.25 }}>
									{avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
								</Typography>
								<Typography sx={{ fontSize: 11, color: '#888', fontWeight: 600, ml: 0.25 }}>
									({reviews.length})
								</Typography>
							</Box>
						</Box>
					</Box>

				{/* SPECIALTIES & CERTIFICATIONS */}
						<Box sx={{ mb: 2.75 }}>
							<Typography sx={{ fontWeight: 800, fontSize: { xs: 24, md: 28 }, color: '#1a1a1a', mb: 2.25, display: 'flex', alignItems: 'center', gap: 1 }}>
								✨ Specialties & Certifications
							</Typography>
							<Grid container spacing={2.5}>
								{/* Specialties */}
								{specialties.length > 0 && (
									<Grid item xs={12} sm={6}>
										<Box sx={{ background: '#fff', p: 3, borderRadius: 3, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.2s ease' }}>
											<Typography sx={{ fontWeight: 800, fontSize: 13, color: '#1a1a1a', mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
												Specialties
											</Typography>
											<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
												{specialties.map((spec, i) => (
													<Chip
														key={i}
														label={spec}
														sx={{
															background: '#fce4ec',
															color: '#ad1457',
															fontWeight: 700,
															fontSize: 12.5,
															height: 30,
															borderRadius: 2,
															boxShadow: '0 2px 6px rgba(173, 20, 87, 0.15)',
															'& .MuiChip-label': { px: 1 }
														}}
													/>
												))}
											</Box>
										</Box>
									</Grid>
								)}
								{/* Certifications */}
								{certificates.length > 0 && (
									<Grid item xs={12} sm={6}>
										<Box sx={{ background: '#fff', p: 3, borderRadius: 3, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.2s ease' }}>
											<Typography sx={{ fontWeight: 800, fontSize: 13, color: '#1a1a1a', mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
												Certifications
											</Typography>
											<Stack spacing={1.25}>
												{certificates.map((cert, i) => (
													<Box key={i} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', pb: i !== certificates.length - 1 ? 1.25 : 0, borderBottom: i !== certificates.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
														<Box sx={{ fontSize: 16, mt: 0.25 }}>🏆</Box>
														<Typography sx={{ fontSize: 14, color: '#333', fontWeight: 600, lineHeight: 1.5 }}>{cert}</Typography>
												</Box>
											))}
										</Stack>
								</Box>
							</Grid>
						)}
					</Grid>
				</Box>

				{/* CLIENT RATINGS BREAKDOWN */}
				{Object.values(averageMetrics).some(v => v > 0) && (
					<Box sx={{ mb: 2.75 }}>
						<Typography sx={{ fontWeight: 800, fontSize: 13, mb: 2.25, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 0.5 }}>
							⭐ Client Ratings
						</Typography>
						<Grid container spacing={2.5}>
							{metricLabels.map(m => (
								<Grid item xs={12} sm={6} md={3} key={m.key}>
									<Box sx={{ background: '#fff', p: 2.5, borderRadius: 3, border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.2s ease' }}>
										<Typography sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1.25, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.4 }}>
											{m.label}
										</Typography>
										<Box sx={{ display: 'flex', gap: 0.15, mb: 0.75 }}>
											{[...Array(5)].map((_, i) => (
												<StarIcon 
													key={i} 
													sx={{ 
														color: i < Math.round(Number(averageMetrics[m.key] || 0)) ? '#ffc107' : '#e0e0e0', 
														fontSize: 13 
													}} 
												/>
											))}
										</Box>
										<Typography sx={{ color: '#e53935', fontWeight: 900, fontSize: 16 }}>
											{(Number(averageMetrics[m.key] || 0)).toFixed(1)}/5
										</Typography>
									</Box>
								</Grid>
							))}
						</Grid>
					</Box>
				)}

						{/* REVIEWS SECTION */}
						<Box sx={{ pb: 0 }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.25, gap: 2 }}>
										<Typography sx={{ fontWeight: 800, fontSize: { xs: 24, md: 28 }, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 1 }}>
											⭐ Reviews {reviews.length > 0 && `(${reviews.length})`}
								</Typography>
								{!showAddReview && (
									<Button 
										variant="contained"
										onClick={handleAddReview}
										sx={{ 
											background: '#e53935',
											color: '#fff',
											fontWeight: 700,
												fontSize: 14,
												borderRadius: 2,
												px: 2.75,
												py: 1.1,
												boxShadow: '0 4px 12px rgba(229, 57, 53, 0.3)',
												'&:hover': { background: '#c62828', boxShadow: '0 6px 16px rgba(229, 57, 53, 0.4)' }
										}}
									>
										Add Review
									</Button>
								)}
							</Box>

							{reviews.length === 0 && !showAddReview && (
									<Box sx={{ textAlign: 'center', py: 3.5, background: '#fafafa', borderRadius: 3, border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
										<Typography sx={{ fontSize: 15, fontWeight: 700, color: '#999', mb: 0.75 }}>
									No reviews yet
								</Typography>
								<Typography sx={{ fontSize: 13, color: '#bbb' }}>
									</Typography>
								</Box>
							)}

							{showAddReview && (
							<Box sx={{ mb: 2.5, p: 3, background: '#f8f9fa', borderRadius: 2, border: '1px solid #eee' }}>
								<form onSubmit={handleReviewSubmit}>
									<Stack spacing={2}>
										<Box>
											<Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1a1a', fontSize: 14 }}>
												Your Rating <span style={{ color: '#e53935' }}>*</span>
											</Typography>
											<Rating
												value={overallRating || 0}
												size="large"
												onChange={(_, value) => handleOverallChange(value)}
											/>
										</Box>
										<TextField 
											label="Share your feedback" 
											placeholder="Tell other clients about your experience..."
											multiline 
											rows={4}
											value={reviewText} 
											onChange={e => setReviewText(e.target.value)}
											fullWidth
											variant="outlined"
											sx={{
												'& .MuiOutlinedInput-root': {
													borderRadius: 1.5,
													fontSize: 14,
													background: '#fff'
												}
											}}
										/>
										<Box>
											<Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#666', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.3 }}>
												Rate specific areas (optional)
											</Typography>
											<Grid container spacing={2}>
												{metricLabels.map(m => (
													<Grid item xs={6} sm={3} key={m.key}>
														<Box>
															<Typography variant="caption" sx={{ fontWeight: 600, color: '#333', display: 'block', mb: 0.75, fontSize: 12 }}>{m.label}</Typography>
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
												fontWeight: 700,
												py: 1,
													fontSize: 14,
													'&:hover': { background: '#c62828' }
												}}
											>
												Post Review
											</Button>
										</Stack>
									</form>
								</Box>
							)}

							{reviews.length > 0 && (
						<Stack spacing={1.75}>
							{reviews.map((review, idx) => (
								<Box 
									key={idx}
									sx={{ 
										p: 2.25,
										background: '#fff',
										borderRadius: 2,
										border: '1px solid #e5e5e5',
										transition: 'all 0.3s ease',
										boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
											'&:hover': {
												boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
												borderColor: '#e0e0e0'
											}
										}}
									>
										{/* Review Header */}
									<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.25, gap: 2 }}>
										<Box sx={{ display: 'flex', gap: 1.25, flex: 1 }}>
											<Avatar 
												src={review.client?.profilePicture} 
												alt={review.client?.name}
												sx={{ width: 32, height: 32, flexShrink: 0 }}
											/>
											<Box>
												<Typography sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: 13.5 }}>
													{review.client?.name || 'Anonymous'}
												</Typography>
												<Typography sx={{ color: '#999', fontSize: 11.5 }}>
													{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
												</Typography>
											</Box>
										</Box>
										<Box sx={{ display: 'flex', gap: 0.15 }}>
											{[...Array(5)].map((_, i) => (
												<StarIcon 
													key={i} 
													sx={{ 
														color: i < review.rating ? '#ffc107' : '#e5e5e5', 
														fontSize: 14 
													}}
												/>
											))}
										</Box>
									</Box>

											{/* Review Text */}
										<Typography sx={{ color: '#555', lineHeight: 1.65, mb: 1, fontSize: 13.5, fontWeight: 500 }}>
											"{review.comment}"
										</Typography>

									{/* Metrics Grid (if any) */}
									{review.metrics && Object.values(review.metrics).some(v => v > 0) && (
										<Box sx={{ pt: 1.25, borderTop: '1px solid #f0f0f0' }}>
											<Grid container spacing={0.75} sx={{ mt: 0 }}>
												{metricLabels.map(m => 
													review.metrics?.[m.key] > 0 ? (
														<Grid item xs={6} sm={3} key={m.key}>
															<Box>
																<Typography sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 0.4, fontSize: 11 }}>
																	{m.label}
																</Typography>
																<Box sx={{ display: 'flex', gap: 0.1 }}>
																	{[...Array(5)].map((_, i) => (
																		<StarIcon 
																			key={i} 
																			sx={{ 
																				color: i < review.metrics[m.key] ? '#e53935' : '#e8e8e8', 
																				fontSize: 11 
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
					</Container>
				</Box>
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
						Your review helps other clients learn about this trainer.
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
