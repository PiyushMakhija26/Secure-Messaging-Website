const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Plain content for now (will be encrypted in final version)
  content: {
    type: String,
    default: null
  },
  username: {
    type: String,
    default: null
  },
  // Server stores ONLY encrypted data - it never knows the actual message content
  encryptedContent: {
    type: String,
    default: null
  },
  nonce: {
    type: String,
    default: null
  },
  senderPublicKey: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for efficient queries
MessageSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
