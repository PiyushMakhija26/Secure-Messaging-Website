const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Import models
const Message = require('./models/Message');
const Room = require('./models/Room');
const User = require('./models/User');

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const userRoutes = require('./routes/users');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-messaging')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);

// WebSocket connection
const wss = new WebSocket.Server({ server });
const rooms = new Map();

wss.on('connection', (ws) => {
  console.log('Client connected');
  let currentRoom = null;
  let currentUser = null;
  let currentRoomDoc = null;

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      console.log('WebSocket message received:', message.type);

      switch (message.type) {
        case 'join-room':
          currentRoom = message.roomId;
          currentUser = message.userId;
          
          // Get room document for saving messages
          currentRoomDoc = await Room.findOne({ roomId: currentRoom });
          
          if (!rooms.has(currentRoom)) {
            rooms.set(currentRoom, new Set());
          }
          rooms.get(currentRoom).add(ws);
          console.log(`User ${currentUser} joined room ${currentRoom}`);
          
          // Broadcast user joined
          broadcastToRoom(currentRoom, {
            type: 'user-joined',
            userId: currentUser,
            timestamp: new Date()
          }, ws);
          break;

        case 'chat-message':
          console.log(`Chat message in room ${currentRoom} from user ${currentUser}: ${message.content}`);
          
          // Save message to database if we have room doc
          if (currentRoomDoc && currentUser) {
            try {
              const newMessage = new Message({
                roomId: currentRoomDoc._id,
                userId: currentUser,
                content: message.content,
                username: message.username,
                encryptedContent: message.encryptedContent || null,
                nonce: message.nonce || null,
                senderPublicKey: message.senderPublicKey || null,
                createdAt: new Date()
              });
              await newMessage.save();
              console.log('Message saved to database');
            } catch (saveError) {
              console.error('Error saving message:', saveError);
            }
          }
          
          // Broadcast to all users in room
          broadcastToRoom(currentRoom, {
            type: 'chat-message',
            userId: currentUser,
            username: message.username,
            content: message.content,
            sender: message.sender || message.username,
            encryptedContent: message.encryptedContent,
            nonce: message.nonce,
            timestamp: message.timestamp || new Date()
          });
          break;

        case 'user-typing':
          broadcastToRoom(currentRoom, {
            type: 'user-typing',
            userId: currentUser
          }, ws);
          break;
      }
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  });

  ws.on('close', () => {
    if (currentRoom && currentUser) {
      broadcastToRoom(currentRoom, {
        type: 'user-left',
        userId: currentUser,
        timestamp: new Date()
      });
      
      const roomClients = rooms.get(currentRoom);
      if (roomClients) {
        roomClients.delete(ws);
        if (roomClients.size === 0) {
          rooms.delete(currentRoom);
        }
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket connection error:', error);
  });
});

function broadcastToRoom(roomId, message, excludeWs = null) {
  const roomClients = rooms.get(roomId);
  if (roomClients) {
    roomClients.forEach(client => {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

// Auto-delete old messages (older than 90 days)
async function deleteOldMessages() {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const result = await Message.deleteMany({
      createdAt: { $lt: ninetyDaysAgo }
    });
    if (result.deletedCount > 0) {
      console.log(`✓ Deleted ${result.deletedCount} old messages`);
    }
  } catch (error) {
    console.error('Error deleting old messages:', error);
  }
}

// Run cleanup on server start
deleteOldMessages();

// Schedule auto-delete to run daily (every 24 hours)
setInterval(deleteOldMessages, 24 * 60 * 60 * 1000);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
