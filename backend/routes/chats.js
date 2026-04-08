const express = require('express');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all chats for a user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [{ client: req.user.id }, { trainer: req.user.id }]
    }).populate('client', 'name profilePicture').populate('trainer', 'name profilePicture').sort({ createdAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get or create a chat
router.post('/', auth, async (req, res) => {
  const { trainerId } = req.body;
  
  console.log('=== CREATE/GET CHAT ===');
  console.log('Client/User ID:', req.user.id);
  console.log('Trainer ID from request:', trainerId);
  console.log('Request body:', req.body);
  
  try {
    if (!trainerId) {
      console.log('ERROR: trainerId is missing');
      return res.status(400).json({ msg: 'Trainer ID is required' });
    }
    
    let chat = await Chat.findOne({
      client: req.user.id,
      trainer: trainerId
    });
    
    console.log('Existing chat found:', !!chat);

    if (!chat) {
      console.log('Creating new chat...');
      chat = new Chat({
        client: req.user.id,
        trainer: trainerId
      });
      await chat.save();
      console.log('Chat created with ID:', chat._id);
    } else {
      console.log('Using existing chat:', chat._id);
    }

    await chat.populate('client', 'name');
    await chat.populate('trainer', 'name');
    
    console.log('Sending response:', {
      _id: chat._id,
      client: chat.client,
      trainer: chat.trainer
    });
    
    res.json(chat);
  } catch (err) {
    console.error('=== CHAT CREATION ERROR ===');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get messages in a chat
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    console.log('=== GET CHAT MESSAGES ===');
    console.log('Chat ID:', req.params.chatId);
    console.log('User ID:', req.user.id);
    
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name email profilePicture')
      .sort({ createdAt: 1 });
    
    console.log('Messages found:', messages.length);
    
    const chat = await Chat.findById(req.params.chatId)
      .populate('client', 'name email profilePicture')
      .populate('trainer', 'name email profilePicture');
    
    console.log('Chat found:', !!chat);
    console.log('Chat client:', chat?.client);
    console.log('Chat trainer:', chat?.trainer);
    
    // Determine the other user
    const otherUserId = chat.client._id.toString() === req.user.id ? chat.trainer._id : chat.client._id;
    const otherUser = chat.client._id.toString() === req.user.id ? chat.trainer : chat.client;
    
    console.log('Other user ID:', otherUserId);
    console.log('Other user:', otherUser);
    
    const response = {
      messages,
      otherUser,
      chat
    };
    
    console.log('Sending response with otherUser:', {
      name: otherUser?.name,
      email: otherUser?.email,
      profilePicture: otherUser?.profilePicture
    });
    
    res.json(response);
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Send a message
router.post('/:chatId/messages', auth, async (req, res) => {
  const { message } = req.body;
  
  console.log('=== MESSAGE RECEIVED ===');
  console.log('ChatId:', req.params.chatId);
  console.log('UserId (from token):', req.user?.id);
  console.log('Message:', message);
  
  try {
    if (!message || !message.trim()) {
      console.log('ERROR: Message is empty');
      return res.status(400).json({ msg: 'Message cannot be empty' });
    }
    
    // Verify chat exists and user is part of it
    const chat = await Chat.findById(req.params.chatId);
    console.log('Chat found:', !!chat);
    
    if (!chat) {
      console.log('ERROR: Chat not found with id:', req.params.chatId);
      return res.status(404).json({ msg: 'Chat not found' });
    }
    
    console.log('Chat client:', chat.client.toString());
    console.log('Chat trainer:', chat.trainer.toString());
    
    const isUserInChat = chat.client.toString() === req.user.id || chat.trainer.toString() === req.user.id;
    console.log('User in chat:', isUserInChat);
    
    if (!isUserInChat) {
      console.log('ERROR: User not authorized for this chat');
      return res.status(403).json({ msg: 'Not authorized to send message in this chat' });
    }
    
    const msg = new Message({
      chat: req.params.chatId,
      sender: req.user.id,
      message: message.trim()
    });
    
    console.log('Saving message...');
    const savedMsg = await msg.save();
    console.log('Message saved with id:', savedMsg._id);
    
    await savedMsg.populate('sender', 'name email profilePicture');
    
    const response = {
      _id: savedMsg._id,
      chat: savedMsg.chat,
      sender: savedMsg.sender,
      senderId: savedMsg.sender._id,
      message: savedMsg.message,
      createdAt: savedMsg.createdAt,
      read: savedMsg.read
    };
    
    console.log('Sending response:', response);
    res.json(response);
  } catch (err) {
    console.error('CATCH ERROR:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ msg: 'Failed to send message', error: err.message });
  }
});

module.exports = router;