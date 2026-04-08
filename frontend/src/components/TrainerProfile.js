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
			<Container maxWidth="xl" sx={{ mt: 10, mb: 6 }}>
			<Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
				<Grid container spacing={3} alignItems="flex-start" sx={{ display: 'flex', width: '100%' }}>
					{/* LEFT COLUMN */}
					<Grid item xs={12} sm={4} md={3} lg={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'flex-start', borderRight: { md: '1px solid #eee' }, pr: { md: 3 }, flexShrink: 0 }}>
						<Card elevation={0} sx={{ width: '100%', maxWidth: 350, p: 3, borderRadius: 4, boxShadow: '0 4px 24px rgba(229,57,53,0.08)', border: '2px solid #e53935' }}>
							<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
								<Avatar src={profilePicture} sx={{ width: 120, height: 120, mb: 2, border: '4px solid #e53935' }} />
								<Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{name}</Typography>
								<Typography variant="body1" sx={{ color: '#888', mb: 1.5 }}><LocationOnIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} />{location}</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
									{[...Array(5)].map((_, i) => {
										const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;
										return <StarIcon key={i} sx={{ color: i < Math.round(avgRating) ? '#ffc107' : '#ccc', fontSize: 22 }} />;
									})}
									<Typography variant="body2" sx={{ ml: 1, color: '#888' }}>
										{reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0.0} ({reviews.length} reviews)
									</Typography>
								</Box>
								<Chip label={`Experience: ${experience} years`} size="small" sx={{ mb: 1.5, background: '#ffeaea', color: '#e53935', fontWeight: 500 }} />
								<Chip label={`$${price}/session`} size="small" sx={{ mb: 3, background: '#ffeaea', color: '#e53935', fontWeight: 700, fontSize: 16 }} />
								<Stack direction="row" spacing={2} sx={{ mb: 3, width: '100%', justifyContent: 'center' }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><GroupIcon sx={{ color: '#e53935' }} /> <Typography variant="body2">{clientsTrained} clients</Typography></Box>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><AssignmentIcon sx={{ color: '#e53935' }} /> <Typography variant="body2">{sessionsCompleted} sessions</Typography></Box>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><DescriptionIcon sx={{ color: '#e53935' }} /> <Typography variant="body2">{certificates.length} certificates</Typography></Box>
								</Stack>
																<Button
																	variant="contained"
																	sx={{ mb: 2, fontWeight: 700, fontSize: 18, borderRadius: 2, background: '#e53935', color: '#fff', '&:hover': { background: '#b71c1c' }, '&:disabled': { background: '#ccc' } }}
																	fullWidth
																	startIcon={messageLoading ? <CircularProgress size={24} /> : <MessageIcon />}
																	onClick={handleMessageClick}
																	disabled={messageLoading}
																>
																	{messageLoading ? 'Starting Chat...' : 'Message Trainer'}
																</Button>
																{/* Login Prompt Dialog */}
																<Dialog open={loginPromptOpen} onClose={handleLoginPromptClose} PaperProps={{ sx: { borderRadius: 4, p: 0, minWidth: 320, maxWidth: 400, boxShadow: 8 } }}>
																	<DialogTitle sx={{ background: '#ffeaea', borderTopLeftRadius: 16, borderTopRightRadius: 16, color: '#e53935', fontWeight: 700 }}>Please log in to message this trainer</DialogTitle>
																	<DialogActions sx={{ px: 3, pb: 2, background: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
																		<Button onClick={handleLoginPromptClose} sx={{ color: '#888', fontWeight: 500, borderRadius: 2 }}>Cancel</Button>
																		<Button onClick={handleLoginRedirect} variant="contained" sx={{ background: '#e53935', color: '#fff', fontWeight: 700, borderRadius: 2 }}>Login</Button>
																	</DialogActions>
																</Dialog>
								<Button variant="outlined" onClick={handleBookSession} sx={{ fontWeight: 700, fontSize: 18, borderRadius: 2, color: '#e53935', borderColor: '#e53935', '&:hover': { borderColor: '#b71c1c', color: '#b71c1c' } }} fullWidth>
									Book a Session
								</Button>
							</Box>
						</Card>
					</Grid>
					
					{/* RIGHT COLUMN */}
					<Grid item xs={12} sm={8} md={9} lg={9} sx={{ pt: 0, display: 'flex', flexDirection: 'column', alignSelf: 'flex-start', flexGrow: 1 }}>
						{/* About Section */}
						<Paper elevation={0} sx={{ p: 3, mb: { xs: 2.5, sm: 3 }, background: '#fafbfc', borderRadius: 3, border: '1px solid #eee' }}>
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>About</Typography>
							<Typography variant="body1" sx={{ color: '#444' }}>{bio || 'No bio provided.'}</Typography>
						</Paper>
						{/* Specialties */}
						<Paper elevation={0} sx={{ p: 3, mb: { xs: 2.5, sm: 3 }, background: '#fafbfc', borderRadius: 3, border: '1px solid #eee' }}>
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Specialties</Typography>
							{specialties.length > 0 ? (
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
									{specialties.map((spec, i) => (
										<Chip key={i} label={spec} sx={{ background: '#ffeaea', color: '#e53935', fontWeight: 500, fontSize: 15 }} />
									))}
								</Box>
							) : (
								<Typography color="text.secondary" sx={{ fontSize: 15 }}>No specialties listed.</Typography>
							)}
						</Paper>
						{/* Certificates */}
						<Paper elevation={0} sx={{ p: 3, mb: { xs: 2.5, sm: 3 }, background: '#fafbfc', borderRadius: 3, border: '1px solid #eee' }}>
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Certificates</Typography>
							{certificates.length > 0 ? (
								<Stack spacing={1.5}>
									{certificates.map((cert, i) => (
										<Paper key={i} elevation={0} sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderRadius: 2, background: '#ffeaea', border: '1px solid #ffcdd2', width: 'fit-content' }}>
											<DescriptionIcon sx={{ color: '#e53935', mr: 1 }} />
											<Typography>{cert}</Typography>
										</Paper>
									))}
								</Stack>
							) : (
								<Typography color="text.secondary" sx={{ fontSize: 15 }}>No certificates listed.</Typography>
							)}
						</Paper>
						{/* Metrics Section */}
						<Paper elevation={0} sx={{ p: 3, mb: { xs: 2.5, sm: 3 }, background: '#fafbfc', borderRadius: 3, border: '1px solid #eee' }}>
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>Current Metrics</Typography>
							<Stack spacing={2}>
								{metricLabels.map(m => (
									<Box key={m.key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
										<StarIcon sx={{ color: '#e53935', fontSize: 22 }} />
										<Typography sx={{ minWidth: 120, fontWeight: 500 }}>{m.label}</Typography>
										<Box sx={{ flex: 1 }}>
											<LinearProgress variant="determinate" value={Number(averageMetrics[m.key] || 0) * 20} sx={{ height: 10, borderRadius: 5, background: '#ffeaea', '& .MuiLinearProgress-bar': { background: '#e53935' } }} />
										</Box>
										<Typography sx={{ minWidth: 40, textAlign: 'right', fontWeight: 700 }}>{averageMetrics[m.key] || 0.0}</Typography>
									</Box>
								))}
							</Stack>
						</Paper>
						{/* Reviews Section */}
						<Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
								<Typography variant="h6" sx={{ fontWeight: 700 }}>Reviews</Typography>
								<Button variant="outlined" sx={{ color: '#e53935', borderColor: '#e53935', '&:hover': { borderColor: '#b71c1c', color: '#b71c1c' } }} onClick={handleAddReview}>Add Review</Button>
							</Box>
							{reviews.length === 0 && !showAddReview && (
								<Paper elevation={0} sx={{ p: 3, textAlign: 'center', background: '#ffeaea', borderRadius: 3, border: '1px solid #ffcdd2' }}>
									<Typography variant="body1" sx={{ mb: 2, color: '#e53935' }}>No reviews yet. Be the first to review this trainer!</Typography>
									<Button variant="contained" sx={{ background: '#e53935', color: '#fff', '&:hover': { background: '#b71c1c' } }} onClick={handleAddReview}>Add Review</Button>
								</Paper>
							)}
							{showAddReview && (
								<Paper elevation={0} sx={{ p: 3, mb: 2.5, borderRadius: 3, background: '#fff', border: '1px solid #eee' }}>
									<form onSubmit={handleReviewSubmit}>
										<Stack spacing={2}>
											{/* Overall Rating */}
											<Box sx={{ mb: 1 }}>
												<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
													Overall Rating <span style={{ color: '#e53935' }}>*</span>
												</Typography>
												<Rating
													name="overall"
													value={overallRating || 0}
													size="large"
													onChange={(_, value) => handleOverallChange(value)}
													onChangeActive={(_, value) => setHover(prev => ({ ...prev, overall: value }))}
												/>
												<Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
													{hover.overall !== -1
														? ratingLabels[hover.overall]
														: overallRating
															? ratingLabels[overallRating]
															: ''}
												</Typography>
											</Box>
											{/* Comment */}
											<TextField label="Comment" multiline minRows={2} value={reviewText} onChange={e => setReviewText(e.target.value)} fullWidth />
											{/* Email (optional or hidden if logged in) */}
											{(!window.localStorage.getItem('user')) && (
												<TextField label="Email (optional)" value={reviewEmail} onChange={e => setReviewEmail(e.target.value)} fullWidth />
											)}
											{/* Required Metrics */}
											<Divider sx={{ mb: 1 }} />
											<Box sx={{ pl: 1, mb: 2 }}>
												<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
													Optional: Rate specific areas
												</Typography>
												{metricLabels.map(m => (
													<Box key={m.key} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
														<Typography variant="body2" sx={{ fontWeight: 500, minWidth: 110 }}>
															{m.label}
														</Typography>
														<Rating
															name={m.key}
															value={reviewMetrics[m.key] || 0}
															size="large"
															onChange={(_, value) => handleReviewChange(m.key, value)}
															onChangeActive={(_, value) => setHover(prev => ({ ...prev, [m.key]: value }))}
															sx={{ mr: 2 }}
														/>
														<Box sx={{ minWidth: 60 }}>
															<Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
																{hover[m.key] !== -1
																	? ratingLabels[hover[m.key]]
																	: reviewMetrics[m.key]
																		? ratingLabels[reviewMetrics[m.key]]
																		: ''}
															</Typography>
														</Box>
														<Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
															{reviewMetrics[m.key] || 0}
														</Typography>
													</Box>
												))}
											</Box>
											<Button type="submit" variant="contained" sx={{ background: '#e53935', color: '#fff', '&:hover': { background: '#b71c1c' } }}>Submit Review</Button>
										</Stack>
									</form>
								</Paper>
							)}
							{/* Review Cards */}
							{reviews.length > 0 && (
								<Stack spacing={2}>
									{reviews.map((review, idx) => (
										<Paper key={idx} elevation={0} sx={{ p: 2.5, borderRadius: 3, background: '#fff', border: '1px solid #eee' }}>
											<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
												<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
													<Avatar src={review.client?.profilePicture} alt={review.client?.name} sx={{ width: 36, height: 36 }} />
													<Box>
														<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{review.client?.name || 'User'}</Typography>
														<Typography variant="caption" sx={{ color: '#888' }}>{new Date(review.createdAt).toLocaleDateString()}</Typography>
													</Box>
												</Box>
												<Box sx={{ display: 'flex', alignItems: 'center' }}>
													{[...Array(5)].map((_, i) => (
														<StarIcon key={i} sx={{ color: i < review.rating ? '#ffc107' : '#ccc', fontSize: 18 }} />
													))}
													<Typography variant="body2" sx={{ ml: 1, fontWeight: 600 }}>{review.rating}/5</Typography>
												</Box>
											</Box>
											<Typography variant="body2" sx={{ mb: 1.5, color: '#333' }}>{review.comment}</Typography>
											{review.metrics && Object.values(review.metrics).some(v => v > 0) && (
												<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
													{metricLabels.map(m => 
														review.metrics?.[m.key] > 0 ? (
															<Box key={m.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
																<Typography variant="caption" sx={{ fontWeight: 500, color: '#666' }}>{m.label}:</Typography>
																<Box sx={{ display: 'flex' }}>
																	{[...Array(5)].map((_, i) => (
																		<StarIcon key={i} sx={{ color: i < review.metrics[m.key] ? '#e53935' : '#ccc', fontSize: 14 }} />
																	))}
																</Box>
															</Box>
														) : null
													)}
												</Box>
											)}
										</Paper>
									))}
								</Stack>
							)}
						</Box>
					</Grid>
				</Grid>
			</Paper>
			</Container>
			
			{/* Success Dialog */}
			<Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)} PaperProps={{ sx: { borderRadius: 4, minWidth: 380, boxShadow: '0 8px 32px rgba(229,57,53,0.25)' } }}>
				<DialogTitle sx={{ background: 'linear-gradient(135deg, #e53935 0%, #b71c1c 100%)', color: '#fff', fontWeight: 700, fontSize: 20, textAlign: 'center', pb: 2 }}>
					✨ Review Posted Successfully!
				</DialogTitle>
				<DialogContent sx={{ textAlign: 'center', pt: 3, pb: 3 }}>
					<Typography sx={{ fontSize: 16, color: '#333', mb: 1 }}>
						Thank you for your feedback!
					</Typography>
					<Typography sx={{ fontSize: 14, color: '#777' }}>
						Your review has been posted and will help other clients make informed decisions.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ pb: 2, px: 3, justifyContent: 'center' }}>
					<Button 
						onClick={() => setSuccessDialogOpen(false)} 
						variant="contained" 
						sx={{ background: '#e53935', color: '#fff', fontWeight: 600, borderRadius: 2, px: 3, '&:hover': { background: '#b71c1c' } }}
					>
						Great!
					</Button>
				</DialogActions>
			</Dialog>

			{/* Error Dialog */}
			<Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)} PaperProps={{ sx: { borderRadius: 4, minWidth: 380, boxShadow: '0 8px 32px rgba(229,57,53,0.25)' } }}>
				<DialogTitle sx={{ background: 'linear-gradient(135deg, #e53935 0%, #b71c1c 100%)', color: '#fff', fontWeight: 700, fontSize: 18, textAlign: 'center', pb: 2 }}>
					⚠️ Oops!
				</DialogTitle>
				<DialogContent sx={{ textAlign: 'center', pt: 3, pb: 3 }}>
					<Typography sx={{ fontSize: 16, color: '#333' }}>
						{errorMessage}
					</Typography>
				</DialogContent>
				<DialogActions sx={{ pb: 2, px: 3, justifyContent: 'center' }}>
					<Button 
						onClick={() => setErrorDialogOpen(false)} 
						variant="contained" 
						sx={{ background: '#e53935', color: '#fff', fontWeight: 600, borderRadius: 2, px: 3, '&:hover': { background: '#b71c1c' } }}
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
			)}		</>
	);
};

export default TrainerProfile;
