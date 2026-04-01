const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  mediaUrl: { type: String }, // for image/video/voice
  mediaType: { type: String, enum: ['image', 'video', 'voice', 'none'], default: 'none' },
  viewOnce: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  reactions: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, emoji: String }],
  type: { type: String, enum: ['text', 'image', 'video', 'voice'], default: 'text' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);