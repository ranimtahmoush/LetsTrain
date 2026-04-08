const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ['image', 'video', 'voice', 'file', 'none'], default: 'none' },
    read: { type: Boolean, default: false },
    reactions: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, emoji: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);