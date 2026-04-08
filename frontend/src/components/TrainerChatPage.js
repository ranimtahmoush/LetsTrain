import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, IconButton, InputBase, Paper, Tooltip, CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import MicIcon from '@mui/icons-material/Mic';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import VideocamIcon from '@mui/icons-material/Videocam';
import CallIcon from '@mui/icons-material/Call';

const socket = io('http://localhost:5000');

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const TrainerChatPage = () => {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef();
  const imageInputRef = useRef();
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/trainers/${trainerId}`);
        setTrainer(res.data?.trainer || res.data);
      } catch (err) {
        setTrainer(null);
      }
    };
    fetchTrainer();
  }, [trainerId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const fetchChat = async () => {
      try {
        // Get or create chat with this trainer
        const res = await axios.post(
          `http://localhost:5000/api/chats/direct`,
          { trainerId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const chatId = res.data.chatId;
        // Fetch messages
        const msgRes = await axios.get(`http://localhost:5000/api/chats/${chatId}/messages`, {
          headers: { 'x-auth-token': token }
        });
        setMessages(msgRes.data.messages || msgRes.data);
        // Set sender info from token
        const parts = token.split('.');
        const decoded = JSON.parse(atob(parts[1]));
        setSender(decoded.user);
        // Join socket room
        socket.emit('joinChat', { chatId });
        socket.on('receiveMessage', (msg) => {
          setMessages(prev => [...prev, { ...msg, _id: Date.now() }]);
        });
        return () => { socket.off('receiveMessage'); };
      } catch (err) {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
    // eslint-disable-next-line
  }, [trainerId]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const token = localStorage.getItem('token');
    try {
      // Get or create chatId again (idempotent)
      const res = await axios.post(
        `http://localhost:5000/api/chats/direct`,
        { trainerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const chatId = res.data.chatId;
      const msgRes = await axios.post(`http://localhost:5000/api/chats/${chatId}/messages`, { message }, { headers: { 'x-auth-token': token } });
      socket.emit('sendDirectMessage', { chatId, message, sender: sender.id });
      setMessages(prev => [...prev, msgRes.data]);
      setMessage('');
    } catch (err) { console.error(err); }
  };

  // Group messages by date
  const groupByDate = (msgs) => {
    const groups = {};
    msgs.forEach(msg => {
      const d = new Date(msg.createdAt);
      const key = d.toDateString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(msg);
    });
    return groups;
  };

  // Date label helper
  const getDateLabel = (dateStr) => {
    const today = new Date();
    const d = new Date(dateStr);
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', zIndex: 2 }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
        <Avatar src={trainer?.profilePicture} sx={{ width: 40, height: 40, ml: 1, mr: 1 }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{trainer?.user?.name || trainer?.name || 'Trainer'}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Optional online status */}
            <Typography sx={{ fontSize: 12, color: '#888' }}>Online</Typography>
          </Box>
        </Box>
        <Tooltip title="Call"><IconButton><CallIcon /></IconButton></Tooltip>
        <Tooltip title="Video"><IconButton><VideocamIcon /></IconButton></Tooltip>
      </Box>

      {/* Messages Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 1, sm: 2 }, py: 2, background: '#fafbfc', position: 'relative' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><CircularProgress color="error" /></Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', color: '#bbb', pt: 8 }}>
            <img src="https://cdn-icons-png.flaticon.com/512/2950/2950651.png" alt="No messages" width={80} style={{ opacity: 0.5, marginBottom: 16 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>No messages yet</Typography>
            <Typography>Start your conversation with {trainer?.user?.name || trainer?.name || 'this trainer'}!</Typography>
          </Box>
        ) : (
          Object.entries(groupByDate(messages)).map(([date, msgs]) => (
            <Box key={date}>
              <Box sx={{ textAlign: 'center', my: 2 }}>
                <Paper sx={{ display: 'inline-block', px: 2, py: 0.5, bgcolor: '#f0f0f0', color: '#888', fontWeight: 500, fontSize: 13, borderRadius: 8, boxShadow: 0 }}>{getDateLabel(date)}</Paper>
              </Box>
              {msgs.map((msg, idx) => {
                const isMe = msg.senderId === sender?.id || msg.sender === sender?.id;
                return (
                  <Box key={msg._id || idx} sx={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', mb: 1.5 }}>
                    <Avatar src={isMe ? sender?.profilePicture : trainer?.profilePicture} sx={{ width: 32, height: 32, mx: 1, boxShadow: '0 2px 8px rgba(229,57,53,0.10)' }} />
                    <Box sx={{ maxWidth: '70%', minWidth: 60, display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <Paper elevation={0} sx={{
                        bgcolor: isMe ? '#e53935' : '#f0f0f0',
                        color: isMe ? '#fff' : '#222',
                        px: 2, py: 1.2, borderRadius: 3,
                        borderTopLeftRadius: isMe ? 18 : 6,
                        borderTopRightRadius: isMe ? 6 : 18,
                        borderBottomLeftRadius: 18,
                        borderBottomRightRadius: 18,
                        fontSize: 15, fontWeight: 400, boxShadow: '0 2px 8px rgba(229,57,53,0.08)',
                        mb: 0.5, position: 'relative',
                        transition: 'background 0.2s'
                      }}>
                        {msg.message}
                      </Paper>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: -0.5 }}>
                        <Typography sx={{ fontSize: 11, color: '#bbb', fontWeight: 500 }}>{formatTime(msg.createdAt)}</Typography>
                        {isMe && <DoneAllIcon sx={{ fontSize: 16, color: msg.read ? '#4cd137' : '#bbb', ml: 0.5 }} />}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Bar */}
      <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #eee', bgcolor: '#fff', boxShadow: '0 -2px 8px rgba(0,0,0,0.03)' }}>
        <Paper elevation={1} sx={{ display: 'flex', alignItems: 'center', borderRadius: 5, px: 1, py: 0.5, boxShadow: '0 2px 8px rgba(229,57,53,0.06)' }}>
          <InputBase
            multiline
            maxRows={4}
            fullWidth
            placeholder="Type a message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            sx={{ ml: 1, flex: 1, fontSize: 16, fontWeight: 400, border: 'none', outline: 'none', background: 'none' }}
            disabled={uploading}
          />
          {uploading && <CircularProgress size={24} sx={{ ml: 2, color: '#e53935' }} />}
          {message.trim() && !uploading && (
            <IconButton color="primary" onClick={sendMessage} sx={{ ml: 1, bgcolor: '#e53935', color: '#fff', borderRadius: 2, '&:hover': { bgcolor: '#b71c1c' } }}>
              <SendIcon />
            </IconButton>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default TrainerChatPage;