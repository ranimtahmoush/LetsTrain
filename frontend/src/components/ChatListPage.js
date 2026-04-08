import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, Paper, CircularProgress, Badge, InputBase, IconButton, Tooltip
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now - date) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff/60)} min ago`;
  if (diff < 86400 && date.getDate() === now.getDate()) return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString();
};

const ChatListPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/chats', {
          headers: { 'x-auth-token': token }
        });
        const chatsData = Array.isArray(res.data) ? res.data : [];
        setChats(chatsData);
      } catch (err) {
        console.error('Failed to fetch chats:', err);
        setChats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const filteredChats = chats.filter(chat =>
    (chat.trainer?.user?.name || chat.trainer?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '100vh', background: '#f5f5f5', pt: 10 }}>
      <Paper elevation={4} sx={{ maxWidth: 420, mx: 'auto', mt: 6, borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(229,57,53,0.10)' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 2, borderBottom: '1px solid #eee', bgcolor: '#fff' }}>
          <IconButton onClick={() => navigate(-1)}><Typography fontWeight={700} fontSize={20}>{'←'}</Typography></IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, flex: 1, textAlign: 'center', color: '#e53935' }}>YOUR CHATS</Typography>
          <Tooltip title="New Message"><IconButton color="primary"><EditIcon /></IconButton></Tooltip>
        </Box>
        {/* Search Bar */}
        <Box sx={{ px: 2, py: 1, bgcolor: '#fafbfc', borderBottom: '1px solid #eee' }}>
          <InputBase
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            startAdornment={<SearchIcon sx={{ color: '#e53935', mr: 1 }} />}
            sx={{ width: '100%', fontSize: 16, bgcolor: '#fff', borderRadius: 2, px: 1, py: 0.5, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
          />
        </Box>
        {/* Chat List */}
        <Box sx={{ maxHeight: 520, overflowY: 'auto', bgcolor: '#fafbfc', p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress color="error" />
            </Box>
          ) : filteredChats.length === 0 ? (
            <Typography sx={{ color: '#888', textAlign: 'center', py: 6 }}>
              You haven't messaged any trainers yet.
            </Typography>
          ) : (
            filteredChats.map((chat, idx) => {
              const name = chat.trainer?.user?.name || chat.trainer?.name || 'Trainer';
              const avatar = chat.trainer?.profilePicture || '';
              const lastMsg = chat.lastMessage ? chat.lastMessage.message : 'No messages yet';
              const isOnline = chat.trainer?.isOnline;
              const unread = chat.unreadCount || 0;
              return (
                <Box
                  key={chat._id}
                  onClick={() => navigate(`/chat/${chat._id}`)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 2, cursor: 'pointer',
                    bgcolor: '#fff', borderBottom: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    borderRadius: 3, mb: 2, transition: 'box-shadow 0.2s, background 0.2s',
                    '&:hover': { boxShadow: '0 4px 16px rgba(229,57,53,0.10)', background: '#fff6f6' }
                  }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color="success"
                    invisible={!isOnline}
                    sx={{
                      '& .MuiBadge-dot': {
                        backgroundColor: '#4cd137',
                        width: 12, height: 12, border: '2px solid #fff',
                      }
                    }}
                  >
                    <Avatar src={avatar} sx={{ width: 48, height: 48, border: '2px solid #e53935' }}>
                      {!avatar && <PersonIcon />}
                    </Avatar>
                  </Badge>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#222', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</Typography>
                    <Typography sx={{ fontSize: 14, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastMsg}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 60 }}>
                    <Typography sx={{ fontSize: 12, color: '#bbb', mb: 0.5 }}>{formatTime(chat.lastMessageTime)}</Typography>
                    {unread > 0 && (
                      <Badge badgeContent={unread} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 12, fontWeight: 700, bgcolor: '#ff3b30' } }} />
                    )}
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatListPage;
