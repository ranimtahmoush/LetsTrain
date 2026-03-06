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
    }).populate('client', 'name').populate('trainer', 'name').sort({ createdAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get or create a chat
router.post('/', auth, async (req, res) => {
  const { trainerId } = req.body;
  try {
    let chat = await Chat.findOne({
      client: req.user.id,
      trainer: trainerId
    });

    if (!chat) {
      chat = new Chat({
        client: req.user.id,
        trainer: trainerId
      });
      await chat.save();
    }

    await chat.populate('client', 'name');
    await chat.populate('trainer', 'name');
    res.json(chat);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get messages in a chat
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Send a message
router.post('/:chatId/messages', auth, async (req, res) => {
  const { message } = req.body;
  try {
    const msg = new Message({
      chat: req.params.chatId,
      sender: req.user.id,
      message
    });
    await msg.save();
    await msg.populate('sender', 'name');
    res.json(msg);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;