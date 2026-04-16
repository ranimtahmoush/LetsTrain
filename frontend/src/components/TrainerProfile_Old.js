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
import EmailIcon from '@mui/icons-material/Email';
import CampaignIcon from '@mui/icons-material/Campaign';

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

	return (
		<>
			<Header />
			<Box sx={{ background: '#fff' }}>
{/* HERO SECTION: LEFT-RIGHT ASYMMETRIC LAYOUT */}
			<Box 
				sx={{ 
					background: `linear-gradient(135deg, rgba(20,20,20,0.65), rgba(20,20,20,0.65)), url('/gym-bg.jpg') center/cover no-repeat`,
					minHeight: 500,
					display: 'flex',
					alignItems: 'center',
					position: 'relative',
					py: 6
				}}
			>
				<Container maxWidth="lg" sx={{ zIndex: 2 }}>
					<Grid container spacing={6} alignItems="center">
						{/* LEFT: Trainer Identity */}
					<Grid item xs={12} md={3}>
							<Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
								<Avatar 
									src={profilePicture} 
									sx={{ 
										width: 120, 
										height: 120,
										boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
										border: '3px solid #fff',
										flexShrink: 0
									}} 
								/>
								<Box sx={{ color: '#fff' }}>
									<Typography variant="h2" sx={{ fontWeight: 900, mb: 0.75, fontSize: { xs: 32, md: 44 }, color: '#fff', lineHeight: 1 }}>
										{name}
									</Typography>
									<Typography sx={{ fontWeight: 500, mb: 1.5, fontSize: 16, color: 'rgba(255,255,255,0.85)' }}>
										{specialties.join(' • ') || 'Fitness Trainer'}
									</Typography>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Box sx={{ display: 'flex', gap: 0.15 }}>
											{[...Array(5)].map((_, i) => {
												const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;
												return <StarIcon key={i} sx={{ color: i < Math.round(avgRating) ? '#ffc107' : 'rgba(255,255,255,0.2)', fontSize: 18 }} />;
											})}
										</Box>
										<Typography sx={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>
											{reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 'N/A'}
										</Typography>
										<Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
											({reviews.length})
										</Typography>
									</Box>
									<Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
											<GroupIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }} />
											<Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{experience} yrs exp</Typography>
										</Box>
										<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
											<LocationOnIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }} />
											<Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{location}</Typography>
										</Box>
									</Box>
								</Box>
							</Box>
						</Grid>

						{/* RIGHT: Booking Panel + Specialties + Certifications Side by Side */}
					<Grid container spacing={3}>
						{/* Booking Panel */}
						<Grid item xs={12} md={4}>
							<Box sx={{ background: '#fff', borderRadius: 4, p: 4, boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)' }}>
								<Box sx={{ mb: 3.5, textAlign: 'center' }}>
									<Typography sx={{ color: '#999', fontSize: 11, fontWeight: 600, letterSpacing: 1, mb: 0.75, textTransform: 'uppercase' }}>Session Rate</Typography>
									<Typography sx={{ fontSize: 56, fontWeight: 900, color: '#1a1a1a', lineHeight: 1 }}>
										${price}
									</Typography>
								</Box>
								<Stack spacing={2}>
									<Button 
										variant="contained" 
										onClick={handleBookSession}
										sx={{ 
											py: 1.75,
											fontWeight: 700,
											fontSize: 16,
											borderRadius: 2.5,
											background: '#e53935',
											color: '#fff',
											boxShadow: '0 6px 20px rgba(229, 57, 53, 0.35)',
											'&:hover': { 
												background: '#c62828',
												boxShadow: '0 8px 28px rgba(229, 57, 53, 0.45)'
											}
										}}
									>
										Book Session
									</Button>
									<Button 
										variant="outlined" 
										onClick={handleMessageClick}
										disabled={messageLoading}
										sx={{ 
											py: 1.75,
											fontWeight: 700,
											fontSize: 16,
											borderRadius: 2.5,
											color: '#e53935',
											borderColor: '#e53935',
											border: '2px solid',
											'&:hover': { 
												background: 'rgba(229, 57, 53, 0.08)',
												borderColor: '#c62828',
												color: '#c62828'
											}
										}}
									>
										{messageLoading ? 'Sending...' : 'Send Message'}
									</Button>
								</Stack>
							</Box>
						</Grid>

						{/* Specialties */}
						{specialties.length > 0 && (
							<Grid item xs={12} md={4}>
								<Box>
									<Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2.5, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 0.5 }}>
										🎯 Specialties
									</Typography>
									<Stack spacing={1.5}>
										{specialties.map((spec, i) => (
											<Box
												key={i}
												sx={{ 
													p: 2,
													background: 'linear-gradient(135deg, #e53935 0%, #d32f2f 100%)',
													color: '#fff',
													borderRadius: 2,
													textAlign: 'center',
													boxShadow: '0 4px 12px rgba(229, 57, 53, 0.2)',
													transition: 'all 0.2s ease',
													'&:hover': {
														transform: 'translateY(-2px)',
														boxShadow: '0 6px 16px rgba(229, 57, 53, 0.3)'
													}
												}}
											>
												<Typography sx={{ fontWeight: 700, fontSize: 14 }}>{spec}</Typography>
											</Box>
										))}
									</Stack>
								</Box>
							</Grid>
						)}

						{/* Certifications */}
						{certificates.length > 0 && (
							<Grid item xs={12} md={4}>
								<Box>
									<Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2.5, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 0.5 }}>
										🏆 Certifications
									</Typography>
									<Stack spacing={1.5}>
										{certificates.map((cert, i) => (
											<Box 
												key={i}
												sx={{ 
													p: 2,
													display: 'flex',
													gap: 1,
													alignItems: 'flex-start',
													background: '#f8f9fa',
													borderRadius: 2,
													border: '1.5px solid #e8e8e8',
													transition: 'all 0.2s ease',
													'&:hover': {
														background: 'linear-gradient(135deg, rgba(229, 57, 53, 0.04) 0%, rgba(255, 0, 87, 0.02) 100%)',
														borderColor: '#e53935'
													}
												}}
											>
												<Box sx={{ color: '#e53935', fontWeight: 900, fontSize: 16, mt: -0.1 }}>✓</Box>
												<Box>
													<Typography sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: 13 }}>{cert}</Typography>
												</Box>
											</Box>
										))}
									</Stack>
								</Box>
							</Grid>
						)}
					</Grid>
					</Grid>
				</Container>
			</Box>
		</Box>

		{/* HERO SEPARATOR */}
		<Box sx={{ height: 60, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05), transparent)' }} />

		{/* MAIN CONTENT */}
		<Box sx={{ background: '#fff', minHeight: '100vh', py: 4 }}>
			<Container maxWidth="lg">
				{/* ABOUT SECTION */}
				<Box sx={{ mb: 6, pb: 4, borderBottom: '1px solid #e8e8e8' }}>
					<Box sx={{ background: 'linear-gradient(135deg, rgba(229, 57, 53, 0.04) 0%, rgba(255, 0, 87, 0.02) 100%)', borderRadius: 2.5, p: 3.5, borderLeft: '4px solid #e53935' }}>
						<Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1.5, color: '#e53935', textTransform: 'uppercase', letterSpacing: 0.5 }}>
							About This Trainer
						</Typography>
						<Typography sx={{ color: '#333', lineHeight: 2, fontSize: 15, fontWeight: 500 }}>
							{bio || 'No bio provided.'}
						</Typography>
					</Box>

					{/* COMPACT STATS SECTION */}
					<Grid container spacing={2.5} sx={{ mb: 5, pb: 4, borderBottom: '1px solid #e8e8e8', mt: 0 }}>
						<Grid item xs={6} sm={3}>
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 28, color: '#e53935', mb: 0.5 }}>{experience}</Typography>
								<Typography sx={{ fontSize: 12, color: '#999', fontWeight: 500 }}>Yrs Experience</Typography>
							</Box>
						</Grid>
						<Grid item xs={6} sm={3}>
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 28, color: '#e53935', mb: 0.5 }}>{clientsTrained}</Typography>
								<Typography sx={{ fontSize: 12, color: '#999', fontWeight: 500 }}>Clients</Typography>
							</Box>
						</Grid>
						<Grid item xs={6} sm={3}>
							<Box>
								<Typography sx={{ fontWeight: 600, fontSize: 28, color: '#e53935', mb: 0.5 }}>{sessionsCompleted}</Typography>
								<Typography sx={{ fontSize: 12, color: '#999', fontWeight: 500 }}>Sessions</Typography>
							</Box>
						</Grid>
						<Grid item xs={6} sm={3}>
							<Box>
								<Box sx={{ display: 'flex', gap: 0.15, mb: 0.5 }}>
									{[...Array(5)].map((_, i) => {
										const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;
										return <StarIcon key={i} sx={{ color: i < Math.round(avgRating) ? '#ffc107' : '#e0e0e0', fontSize: 16 }} />;
									})}
								</Box>
								<Typography sx={{ fontSize: 12, color: '#999', fontWeight: 500 }}>
									{reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 'N/A'}
								</Typography>
							</Box>
						</Grid>
					</Grid>
				</Box>

				{/* CONTACT & STATS INFO SECTION */}
				<Box sx={{ mb: 6, pb: 4, borderBottom: '1px solid #e8e8e8' }}>
				<Grid container spacing={2.5}>
					{/* Email */}
					<Grid item xs={12} sm={6} md={4} lg={2}>
						<Box sx={{ 
							p: 3, 
							background: 'linear-gradient(135deg, rgba(229, 57, 53, 0.08) 0%, rgba(255, 0, 87, 0.04) 100%)',
							borderRadius: 2.5,
							border: '1.5px solid rgba(229, 57, 53, 0.2)',
							transition: 'all 0.3s ease',
							'&:hover': {
								transform: 'translateY(-2px)',
								boxShadow: '0 8px 20px rgba(229, 57, 53, 0.15)',
								borderColor: '#e53935'
							},
							textAlign: 'center'
						}}>
							<Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
								<EmailIcon sx={{ fontSize: 28, color: '#e53935' }} />
							</Box>
							<Typography sx={{ fontSize: 11, color: '#999', fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</Typography>
							<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', wordBreak: 'break-all' }}>{email || 'N/A'}</Typography>
						</Box>
					</Grid>

					{/* Location */}
					<Grid item xs={12} sm={6} md={4} lg={2}>
						<Box sx={{ 
							p: 3, 
							background: 'linear-gradient(135deg, rgba(229, 57, 53, 0.08) 0%, rgba(255, 0, 87, 0.04) 100%)',
							borderRadius: 2.5,
							border: '1.5px solid rgba(229, 57, 53, 0.2)',
							transition: 'all 0.3s ease',
							'&:hover': {
								transform: 'translateY(-2px)',
								boxShadow: '0 8px 20px rgba(229, 57, 53, 0.15)',
								borderColor: '#e53935'
							},
							textAlign: 'center'
						}}>
							<Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
								<LocationOnIcon sx={{ fontSize: 28, color: '#e53935' }} />
							</Box>
							<Typography sx={{ fontSize: 11, color: '#999', fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>Location</Typography>
							<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{location || 'N/A'}</Typography>
						</Box>
					</Grid>

					{/* Instagram */}
					{instagram && (
						<Grid item xs={12} sm={6} md={4} lg={2}>
							<Box sx={{ 
								p: 3, 
								background: 'linear-gradient(135deg, rgba(229, 57, 53, 0.08) 0%, rgba(255, 0, 87, 0.04) 100%)',
								borderRadius: 2.5,
								border: '1.5px solid rgba(229, 57, 53, 0.2)',
								transition: 'all 0.3s ease',
								'&:hover': {
									transform: 'translateY(-2px)',
									boxShadow: '0 8px 20px rgba(229, 57, 53, 0.15)',
									borderColor: '#e53935'
								},
								textAlign: 'center'
							}}>
								<Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
									<CampaignIcon sx={{ fontSize: 28, color: '#e53935' }} />
								</Box>
								<Typography sx={{ fontSize: 11, color: '#999', fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>Instagram</Typography>
								<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', wordBreak: 'break-all' }}>@{instagram}</Typography>
							</Box>
						</Grid>
					)}

					{/* TikTok */}
					{tiktok && (
						<Grid item xs={12} sm={6} md={4} lg={2}>
							<Box sx={{ 
								p: 3, 
								background: 'linear-gradient(135deg, rgba(229, 57, 53, 0.08) 0%, rgba(255, 0, 87, 0.04) 100%)',
								borderRadius: 2.5,
								border: '1.5px solid rgba(229, 57, 53, 0.2)',
								transition: 'all 0.3s ease',
								'&:hover': {
									transform: 'translateY(-2px)',
									boxShadow: '0 8px 20px rgba(229, 57, 53, 0.15)',
									borderColor: '#e53935'
								},
								textAlign: 'center'
							}}>
								<Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
									<CampaignIcon sx={{ fontSize: 28, color: '#e53935' }} />
								</Box>
								<Typography sx={{ fontSize: 11, color: '#999', fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>TikTok</Typography>
								<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', wordBreak: 'break-all' }}>@{tiktok}</Typography>
							</Box>
						</Grid>
					)}
				</Grid>
			</Box>

			{/* CLIENT RATINGS SECTION */}
			{Object.values(averageMetrics).some(v => v > 0) && (
				<Box sx={{ mb: 5, pb: 4, borderBottom: '1px solid #e8e8e8' }}>
					<Typography sx={{ fontWeight: 700, fontSize: 15, mb: 2, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>
						Client Ratings
					</Typography>
					<Grid container spacing={3}>
						{metricLabels.map(m => (
							<Grid item xs={12} sm={6} md={3} key={m.key}>
								<Box>
									<Typography sx={{ fontWeight: 600, color: '#333', mb: 1, fontSize: 13 }}>
										{m.label}
									</Typography>
									<Box sx={{ display: 'flex', gap: 0.2, mb: 0.5 }}>
										{[...Array(5)].map((_, i) => (
											<StarIcon 
												key={i} 
												sx={{ 
													color: i < Math.round(Number(averageMetrics[m.key] || 0)) ? '#ffc107' : '#e0e0e0', 
													fontSize: 16 
												}} 
											/>
										))}
									</Box>
									<Typography sx={{ color: '#999', fontWeight: 600, fontSize: 12 }}>
										{(Number(averageMetrics[m.key] || 0)).toFixed(1)}/5
									</Typography>
								</Box>
							</Grid>
						))}
					</Grid>
				</Box>
				)}

				{/* REVIEWS SECTION */}
				<Box>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
					<Typography sx={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: 0.5, color: '#999' }}>
							Reviews {reviews.length > 0 && `(${reviews.length})`}
						</Typography>
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
									py: 0.6,
									'&:hover': { background: '#c62828' }
								}}
							>
								Add Review
							</Button>
						)}
						</Box>

						{reviews.length === 0 && !showAddReview && (
						<Box sx={{ textAlign: 'center', py: 6 }}>
							<Typography variant="body2" sx={{ color: '#999', mb: 2.5, fontSize: 15 }}>
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
						<Box sx={{ mb: 3, p: 3, background: '#f8f9fa', borderRadius: 2.5, border: '1px solid #e8e8e8' }}>
								<form onSubmit={handleReviewSubmit}>
									<Stack spacing={2.5}>
										<Box>
											<Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#1a1a1a', fontSize: 14 }}>
												Overall Rating <span style={{ color: '#e53935' }}>*</span>
											</Typography>
											<Box sx={{ display: 'flex', gap: 1 }}>
												{[...Array(5)].map((_, i) => (
													<IconButton 
														key={i}
														onClick={() => handleOverallChange(i + 1)}
														sx={{ p: 0, fontSize: 28 }}
													>
														<StarIcon sx={{ color: i < overallRating ? '#ffc107' : '#e0e0e0', fontSize: 28 }} />
													</IconButton>
												))}
											</Box>
										</Box>
										<TextField 
											label="Your feedback" 
											multiline 
											rows={3}
											value={reviewText} 
											onChange={e => setReviewText(e.target.value)}
											fullWidth
											variant="outlined"
											placeholder="Share your experience with this trainer..."
											sx={{
												'& .MuiOutlinedInput-root': {
													borderRadius: 1.5,
													fontSize: 14
												}
											}}
										/>
										<Box>
											<Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: '#1a1a1a', fontSize: 14 }}>Rate specific areas (optional)</Typography>
											<Grid container spacing={2}>
												{metricLabels.map(m => (
													<Grid item xs={6} sm={3} key={m.key}>
														<Box>
															<Typography variant="caption" sx={{ fontWeight: 500, color: '#666', display: 'block', mb: 0.75, fontSize: 12 }}>{m.label}</Typography>
															<Box sx={{ display: 'flex', gap: 0.25 }}>
																{[...Array(5)].map((_, i) => (
																	<IconButton 
																		key={i}
																		onClick={() => handleReviewChange(m.key, i + 1)}
																		sx={{ p: 0.25, fontSize: 18 }}
																	>
																		<StarIcon sx={{ color: i < (reviewMetrics[m.key] || 0) ? '#ffc107' : '#e0e0e0', fontSize: 18 }} />
																	</IconButton>
																))}
															</Box>
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
												py: 1.25,
												borderRadius: 2,
												fontSize: 14,
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
							<Stack spacing={2.5}>
								{reviews.map((review, idx) => (
									<Box 
										key={idx}
										sx={{ 
											p: 3,
											background: '#f8f9fa',
											borderRadius: 2,
											border: '1px solid #e8e8e8'
										}}
									>
										<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
											<Box sx={{ display: 'flex', gap: 1.5 }}>
												<Avatar 
													src={review.client?.profilePicture} 
													alt={review.client?.name}
													sx={{ width: 40, height: 40 }}
												/>
												<Box>
													<Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
														{review.client?.name || 'Anonymous'}
													</Typography>
													<Typography variant="caption" sx={{ color: '#999', fontSize: 12 }}>
														{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
													</Typography>
												</Box>
											</Box>
											<Box sx={{ display: 'flex', gap: 0.1 }}>
												{[...Array(5)].map((_, i) => (
													<StarIcon 
														key={i} 
														sx={{ 
															color: i < review.rating ? '#ffc107' : '#e0e0e0', 
															fontSize: 16 
														}} 
													/>
												))}
											</Box>
										</Box>

										<Typography variant="body2" sx={{ color: '#555', lineHeight: 1.8, mb: 2, fontSize: 14 }}>
											"{review.comment}"
										</Typography>

										{review.metrics && Object.values(review.metrics).some(v => v > 0) && (
											<Grid container spacing={1.5} sx={{ pt: 2, borderTop: '1px solid #e0e0e0' }}>
												{metricLabels.map(m => 
													review.metrics?.[m.key] > 0 ? (
														<Grid item xs={6} sm={3} key={m.key}>
															<Box>
																<Typography variant="caption" sx={{ color: '#999', fontWeight: 500, display: 'block', mb: 0.5, fontSize: 11 }}>
																	{m.label}
																</Typography>
																<Box sx={{ display: 'flex', gap: 0.1 }}>
																	{[...Array(5)].map((_, i) => (
																		<StarIcon 
																			key={i} 
																			sx={{ 
																				color: i < review.metrics[m.key] ? '#e53935' : '#e0e0e0', 
																				fontSize: 12 
																			}} 
																		/>
																	))}
																</Box>
															</Box>
														</Grid>
													) : null
												)}
											</Grid>
										)}
									</Box>
								))}
							</Stack>
						)}
					</Box>
				</Container>
			</Box>
			{bookingModalOpen && (
				<BookingModal
					isOpen={bookingModalOpen}
					onClose={handleBookingModalClose}
					trainer={trainer}
				/>
			)}

			{/* Login Prompt Dialog */}
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
		</>
	);
};

export default TrainerProfile;
