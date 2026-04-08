import React, { useState, useEffect } from 'react';
import './Messages.css';
import { Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const Messages = () => {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [referrer, setReferrer] = useState(location.state?.from || '/trainers');

    useEffect(() => {
        // If conversationId is in URL, immediately fetch trainer info
        if (conversationId && conversationId !== 'undefined') {
            const fetchTrainerInfo = async () => {
                try {
                    const trainerResponse = await axios.get(`http://localhost:5000/api/trainers/${conversationId}`);
                    const trainerData = trainerResponse.data.trainer || trainerResponse.data;
                    const userdata = trainerData.user || trainerData;
                    
                    // Try multiple name field combinations
                    let trainerName = trainerData.name || 
                                     userdata.name ||
                                     (trainerData.firstName && trainerData.lastName ? `${trainerData.firstName} ${trainerData.lastName}` : null) ||
                                     (userdata.firstName && userdata.lastName ? `${userdata.firstName} ${userdata.lastName}` : null) ||
                                     trainerData.firstName ||
                                     userdata.firstName ||
                                     'Trainer';
                    
                    setSelectedTrainer({
                        name: trainerName,
                        avatar: trainerData.avatar || userdata.profilePicture || 'https://via.placeholder.com/50',
                        trainerId: trainerData._id
                    });
                } catch (error) {
                    console.error('Error fetching trainer info:', error);
                    // Fallback: try generic name
                    setSelectedTrainer({
                        name: 'Trainer',
                        avatar: 'https://via.placeholder.com/50',
                        trainerId: conversationId
                    });
                }
            };
            fetchTrainerInfo();
        }
    }, [conversationId]);

    useEffect(() => {
        // Fetch real conversations from the backend
        const fetchConversations = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/chats', {
                    headers: { 'x-auth-token': token }
                });
                const chats = response.data;
                
                console.log('=== FETCH CONVERSATIONS ===');
                console.log('Chats received:', chats.length);
                
                // Format conversations data - always show the trainer
                const formattedConversations = await Promise.all(chats.map(async (chat) => {
                    console.log('Chat:', {
                        _id: chat._id,
                        client: chat.client?.name,
                        trainer: chat.trainer?.name
                    });
                    
                    // Fetch messages for this chat to get the last message
                    let lastMessage = 'No messages yet';
                    let messageCount = 0;
                    let lastMessageDate = chat.updatedAt || chat.createdAt || new Date();
                    try {
                        const messagesRes = await axios.get(
                            `http://localhost:5000/api/chats/${chat._id}/messages`,
                            { headers: { 'x-auth-token': token } }
                        );
                        const messages = messagesRes.data.messages || [];
                        messageCount = messages.length;
                        if (messages.length > 0) {
                            const lastMsg = messages[messages.length - 1];
                            lastMessage = lastMsg.message?.substring(0, 50) || 'No message content';
                            lastMessageDate = lastMsg.createdAt || new Date();
                        }
                    } catch (err) {
                        console.error('Error fetching messages for chat:', chat._id, err);
                    }
                    
                    return {
                        _id: chat._id,
                        trainerId: chat.trainer._id,
                        name: chat.trainer?.name || 'Trainer',
                        avatar: chat.trainer?.profilePicture || 'https://via.placeholder.com/50',
                        lastMessage: lastMessage,
                        messageCount: messageCount,
                        lastMessageDate: lastMessageDate,
                        messages: []
                    };
                }));
                
                // Sort conversations: conversations with messages first, then by most recent
                formattedConversations.sort((a, b) => {
                    // First, prioritize conversations with messages
                    if (a.messageCount > 0 && b.messageCount === 0) return -1; // a comes first
                    if (a.messageCount === 0 && b.messageCount > 0) return 1; // b comes first
                    
                    // If both have messages or both don't, sort by date (most recent first)
                    const dateA = new Date(a.lastMessageDate);
                    const dateB = new Date(b.lastMessageDate);
                    return dateB - dateA;
                });
                
                console.log('Formatted conversations:', formattedConversations);
                setConversations(formattedConversations);
                
                // If conversationId is in URL, automatically select that conversation and fetch messages
                if (conversationId && conversationId !== 'undefined') {
                    // First try to find by conversation ID
                    let selectedConv = formattedConversations.find(conv => conv._id === conversationId);
                    
                    // If not found by conversation ID, try to find by trainer/participant ID
                    if (!selectedConv) {
                        selectedConv = formattedConversations.find(conv => conv.trainerId === conversationId);
                    }
                    
                    if (selectedConv) {
                        setSelectedConversation(selectedConv);
                        setSelectedTrainer({
                            name: selectedConv.name,
                            avatar: selectedConv.avatar
                        });
                        
                        // Fetch messages for this conversation
                        try {
                            const messagesRes = await axios.get(
                                `http://localhost:5000/api/chats/${selectedConv._id}/messages`,
                                { headers: { 'x-auth-token': token } }
                            );
                            const messages = messagesRes.data.messages || messagesRes.data;
                            setSelectedConversation(prev => ({
                                ...prev,
                                messages: messages
                            }));
                        } catch (err) {
                            console.error('Error fetching messages for conversation:', err);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching conversations:', error);
                setConversations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [conversationId]);

    const handleBack = () => {
        navigate(referrer);
    };

    const selectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        setSelectedTrainer({
            name: conversation.name,
            avatar: conversation.avatar
        });
        
        // Update URL to include conversation ID
        navigate(`/messages/${conversation._id}`);
        
        // Fetch actual messages for this conversation from backend
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/chats/${conversation._id}/messages`, {
                headers: { 'x-auth-token': token }
            });
            
            const messages = res.data.messages || res.data;
            console.log('Fetched messages for conversation:', messages);
            
            // Update the conversation with actual messages
            setSelectedConversation(prev => ({
                ...prev,
                messages: messages
            }));
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        
        try {
            const token = localStorage.getItem('token');
            let chatId = selectedConversation?._id;
            console.log('Send message - hasSelectedConversation:', !!selectedConversation, 'chatId:', chatId);
            
            // If no conversation exists yet, create one first
            if (!chatId && conversationId && conversationId !== 'undefined') {
                console.log('Creating new conversation for trainer:', conversationId);
                const createChatResponse = await axios.post('http://localhost:5000/api/chats', {
                    trainerId: conversationId
                }, {
                    headers: { 'x-auth-token': token }
                });
                console.log('Chat created:', createChatResponse.data);
                chatId = createChatResponse.data._id;
                
                // Update the selected conversation
                setSelectedConversation({
                    _id: createChatResponse.data._id,
                    name: selectedTrainer?.name,
                    avatar: selectedTrainer?.avatar,
                    trainerId: conversationId,
                    messages: []
                });
            }
            
            if (chatId) {
                console.log('Sending message to chat:', chatId, 'Message:', newMessage);
                const response = await axios.post(`http://localhost:5000/api/chats/${chatId}/messages`, {
                    message: newMessage
                }, {
                    headers: { 'x-auth-token': token }
                });
                console.log('Message response:', response.data);
                
                // Update the conversation with the new message
                setSelectedConversation(prev => {
                    const updated = {
                        ...prev,
                        messages: [...(prev?.messages || []), response.data]
                    };
                    console.log('Updated conversation:', updated);
                    return updated;
                });
                setNewMessage('');
            } else {
                console.error('No chatId available for sending message');
            }
        } catch (error) {
            console.error('Error sending message:', error.response?.data || error.message);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const filteredConversations = conversations.filter(conv => 
        conv.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="messages-page">
            {/* Sidebar with conversations list */}
            <div className="messages-sidebar">
                <div className="sidebar-header">
                    <button className="back-btn-sidebar" onClick={handleBack}>
                        <ArrowBackIcon />
                    </button>
                    <h1>Messages</h1>
                    <button className="new-message-btn">+</button>
                </div>
                <div className="search-box">
                    <SearchIcon className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search conversations..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="conversations">
                    {loading ? (
                        <p className="loading">Loading conversations...</p>
                    ) : filteredConversations.length > 0 ? (
                        filteredConversations.map(conversation => (
                            <div
                                key={conversation._id}
                                className={`conversation ${selectedConversation?._id === conversation._id ? 'active' : ''}`}
                                onClick={() => selectConversation(conversation)}
                            >
                                <Avatar 
                                    src={conversation.avatar} 
                                    alt={conversation.name}
                                    className="avatar"
                                />
                                <div className="conversation-info">
                                    <h3>{conversation.name}</h3>
                                    {conversation.messageCount > 0 ? (
                                        <div className="last-message-container">
                                            <span className="message-ticks">✓✓</span>
                                            <p>{conversation.lastMessage}</p>
                                        </div>
                                    ) : (
                                        <p>{conversation.lastMessage}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-conversations">You haven't messaged anyone yet</p>
                    )}
                </div>
            </div>

            {/* Chat view on the right */}
            <div className="messages-main">
                {selectedConversation ? (
                    <>
                        <div className="messages-header">
                            <div className="header-user">
                                <Avatar 
                                    src={selectedTrainer?.avatar} 
                                    alt={selectedTrainer?.name}
                                />
                                <div>
                                    <h2>{selectedTrainer?.name}</h2>
                                </div>
                            </div>
                            <button className="more-options">⋮</button>
                        </div>
                        <div className="chat-area">
                            {selectedConversation && selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                                selectedConversation.messages.map((message, index) => {
                                    // Determine if message is sent by current user
                                    const token = localStorage.getItem('token');
                                    let currentUserId = null;
                                    if (token) {
                                        try {
                                            const parts = token.split('.');
                                            const decoded = JSON.parse(atob(parts[1]));
                                            currentUserId = decoded.user.id;
                                        } catch (e) {
                                            console.error('Error decoding token:', e);
                                        }
                                    }
                                    
                                    const isSent = message.senderId === currentUserId || message.sender?.id === currentUserId || message.sender?._id === currentUserId;
                                    
                                    return (
                                        <div key={index} className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
                                            <p>{message.message}</p>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="empty-chat">
                                    <div className="empty-icon">
                                        <Avatar 
                                            src={selectedTrainer?.avatar} 
                                            alt={selectedTrainer?.name}
                                            sx={{ width: 100, height: 100 }}
                                        />
                                    </div>
                                    <h3>{selectedTrainer?.name}</h3>
                                    <p>Start the conversation</p>
                                </div>
                            )}
                        </div>
                        <div className="message-composer">
                            <AttachFileIcon className="attach-icon" />
                            <input 
                                type="text" 
                                value={newMessage} 
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Aa" 
                                disabled={!selectedConversation}
                            />
                            <button onClick={sendMessage} className="send-btn" disabled={!selectedConversation}>
                                <SendIcon />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-selection">
                        <div className="selection-icon">💬</div>
                        <h3>Your messages</h3>
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;