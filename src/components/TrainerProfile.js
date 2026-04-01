import Header from './Header';
import { useAuth } from './AuthContext';
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

	const handleMessageClick = () => {
		if (!user) {
			setLoginPromptOpen(true);
			return;
		}
		if (!trainer || !trainer._id) return;
		navigate(`/messages/${trainer._id}`);
	};

	const handleLoginPromptClose = () => setLoginPromptOpen(false);

	const handleLoginRedirect = () => {
		setLoginPromptOpen(false);
		navigate(`/login?returnUrl=/trainer/${id}?message=1`);
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
	const handleReviewSubmit = (e) => {
		e.preventDefault();
		// TODO: Submit review to backend
		setShowAddReview(false);
		setReviewText('');
		setReviewEmail('');
		setReviewMetrics({ knowledge: 0, communication: 0, motivation: 0, results: 0 });
		setOverallRating(0);
		setShowDetails(false);
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
			<Container maxWidth="lg" sx={{ mt: 10, mb: 6 }}>
			<Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
				<Grid container spacing={4}>
					{/* LEFT COLUMN */}
					<Grid item xs={12} md={4} lg={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: { md: '1px solid #eee' }, pr: { md: 4 } }}>
						<Card elevation={0} sx={{ width: '100%', maxWidth: 350, p: 3, borderRadius: 4, boxShadow: '0 4px 24px rgba(229,57,53,0.08)', border: '2px solid #e53935' }}>
							<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
								<Avatar src={profilePicture} sx={{ width: 120, height: 120, mb: 2, border: '4px solid #e53935' }} />
								<Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{name}</Typography>
								<Typography variant="body1" sx={{ color: '#888', mb: 1 }}><LocationOnIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} />{location}</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
									{[...Array(5)].map((_, i) => (
										<StarIcon key={i} sx={{ color: '#ccc', fontSize: 22 }} />
									))}
									<Typography variant="body2" sx={{ ml: 1, color: '#888' }}>0.0 (0 reviews)</Typography>
								</Box>
								<Chip label={`Experience: ${experience} years`} size="small" sx={{ mb: 1, background: '#ffeaea', color: '#e53935', fontWeight: 500 }} />
								<Chip label={`$${price}/session`} size="small" sx={{ mb: 2, background: '#ffeaea', color: '#e53935', fontWeight: 700, fontSize: 16 }} />
								<Stack direction="row" spacing={2} sx={{ mb: 2, width: '100%', justifyContent: 'center' }}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><GroupIcon sx={{ color: '#e53935' }} /> <Typography variant="body2">{clientsTrained} clients</Typography></Box>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><AssignmentIcon sx={{ color: '#e53935' }} /> <Typography variant="body2">{sessionsCompleted} sessions</Typography></Box>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><DescriptionIcon sx={{ color: '#e53935' }} /> <Typography variant="body2">{certificates.length} certificates</Typography></Box>
								</Stack>
																<Button
																	variant="contained"
																	sx={{ mb: 1, fontWeight: 700, fontSize: 18, borderRadius: 2, background: '#e53935', color: '#fff', '&:hover': { background: '#b71c1c' } }}
																	fullWidth
																	startIcon={<MessageIcon />}
																	onClick={handleMessageClick}
																>
																	Message Trainer
																</Button>
																{/* Login Prompt Dialog */}
																<Dialog open={loginPromptOpen} onClose={handleLoginPromptClose} PaperProps={{ sx: { borderRadius: 4, p: 0, minWidth: 320, maxWidth: 400, boxShadow: 8 } }}>
																	<DialogTitle sx={{ background: '#ffeaea', borderTopLeftRadius: 16, borderTopRightRadius: 16, color: '#e53935', fontWeight: 700 }}>Please log in to message this trainer</DialogTitle>
																	<DialogActions sx={{ px: 3, pb: 2, background: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
																		<Button onClick={handleLoginPromptClose} sx={{ color: '#888', fontWeight: 500, borderRadius: 2 }}>Cancel</Button>
																		<Button onClick={handleLoginRedirect} variant="contained" sx={{ background: '#e53935', color: '#fff', fontWeight: 700, borderRadius: 2 }}>Login</Button>
																	</DialogActions>
																</Dialog>
								<Button variant="outlined" sx={{ fontWeight: 700, fontSize: 18, borderRadius: 2, color: '#e53935', borderColor: '#e53935', '&:hover': { borderColor: '#b71c1c', color: '#b71c1c' } }} fullWidth>
									Book a Session
								</Button>
							</Box>
						</Card>
					</Grid>
					{/* RIGHT COLUMN */}
					<Grid item xs={12} md={8} lg={8}>
						{/* About Section */}
						<Paper elevation={0} sx={{ p: 3, mb: 3, background: '#fafbfc', borderRadius: 3 }}>
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>About</Typography>
							<Typography variant="body1" sx={{ color: '#444' }}>{bio || 'No bio provided.'}</Typography>
						</Paper>
						{/* Specialties */}
						<Box sx={{ mb: 3 }}>
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Specialties</Typography>
							{specialties.length > 0 ? (
								<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
									{specialties.map((spec, i) => (
										  <Chip key={i} label={spec} sx={{ background: '#ffeaea', color: '#e53935', fontWeight: 500, fontSize: 15 }} />
									))}
								</Box>
							) : (
								<Typography color="text.secondary">No specialties listed.</Typography>
							)}
						</Box>
						{/* Certificates */}
						<Box sx={{ mb: 3 }}>
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Certificates</Typography>
							{certificates.length > 0 ? (
								<Stack spacing={1}>
									{certificates.map((cert, i) => (
										<Paper key={i} elevation={1} sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderRadius: 2, background: '#ffeaea', width: 'fit-content' }}>
											<DescriptionIcon sx={{ color: '#e53935', mr: 1 }} />
											<Typography>{cert}</Typography>
										</Paper>
									))}
								</Stack>
							) : (
								<Typography color="text.secondary">No certificates listed.</Typography>
							)}
						</Box>
						{/* Metrics Section */}
						<Box sx={{ mb: 3 }}>
							<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Current Metrics</Typography>
							<Stack spacing={2}>
								{metricLabels.map(m => (
									<Box key={m.key} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
										<StarIcon sx={{ color: '#e53935', fontSize: 22 }} />
										<Typography sx={{ minWidth: 120, fontWeight: 500 }}>{m.label}</Typography>
										<Box sx={{ flex: 1 }}>
											<LinearProgress variant="determinate" value={0} sx={{ height: 10, borderRadius: 5, background: '#ffeaea' }} />
										</Box>
										<Typography sx={{ minWidth: 40, textAlign: 'right', fontWeight: 700 }}>0.0</Typography>
									</Box>
								))}
							</Stack>
						</Box>
						{/* Reviews Section */}
						<Box>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
								<Typography variant="h6" sx={{ fontWeight: 700 }}>Reviews</Typography>
								<Button variant="outlined" sx={{ color: '#e53935', borderColor: '#e53935', '&:hover': { borderColor: '#b71c1c', color: '#b71c1c' } }} onClick={handleAddReview}>Add Review</Button>
							</Box>
							{reviews.length === 0 && !showAddReview && (
								<Paper elevation={0} sx={{ p: 3, textAlign: 'center', background: '#ffeaea', borderRadius: 3 }}>
									<Typography variant="body1" sx={{ mb: 2, color: '#e53935' }}>No reviews yet. Be the first to review this trainer!</Typography>
									<Button variant="contained" sx={{ background: '#e53935', color: '#fff', '&:hover': { background: '#b71c1c' } }} onClick={handleAddReview}>Add Review</Button>
								</Paper>
							)}
							{showAddReview && (
								<Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3, background: '#fff', border: '1px solid #eee', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
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
							{/* TODO: Render review cards if reviews exist */}
						</Box>
					</Grid>
				</Grid>
			</Paper>
			</Container>
		</>
	);
};

export default TrainerProfile;
