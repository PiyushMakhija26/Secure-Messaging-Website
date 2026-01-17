const express = require('express');
const Room = require('../models/Room');
const User = require('../models/User');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      console.log('No token provided. Authorization header:', authHeader);
      return res.status(401).json({ error: 'No token provided' });
    }

    const secret = process.env.JWT_SECRET || 'mysecretkey123';
    console.log('Verifying token with secret:', secret.substring(0, 10) + '...');
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ error: 'Invalid token: ' + error.message });
  }
};

// Create room
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { name, description, password } = req.body;
    console.log(`Creating room for user: ${req.userId}`);

    if (!name || !password) {
      return res.status(400).json({ error: 'Name and password are required' });
    }

    const room = new Room({
      name,
      description,
      adminId: req.userId,
      passwordHash: password
    });

    room.addMember(req.userId);
    console.log(`Room members before save: ${room.members.map(m => m.userId.toString()).join(', ')}`);
    await room.save();
    console.log(`Room created: ${room.roomId}, members: ${room.members.map(m => m.userId.toString()).join(', ')}`);

    res.status(201).json({
      message: 'Room created successfully',
      room: {
        id: room._id,
        roomId: room.roomId,
        name: room.name,
        description: room.description,
        adminId: room.adminId,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('Room creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Join room
router.post('/join', verifyToken, async (req, res) => {
  try {
    const { roomId, password } = req.body;

    if (!roomId || !password) {
      return res.status(400).json({ error: 'Room ID and password are required' });
    }

    const room = await Room.findOne({ roomId }).populate('members.userId', 'username email');
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const isValidPassword = await room.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid room password' });
    }

    if (!room.isMember(req.userId)) {
      room.addMember(req.userId);
      await room.save();
    }

    res.json({
      message: 'Joined room successfully',
      room: {
        id: room._id,
        roomId: room.roomId,
        name: room.name,
        description: room.description,
        adminId: room.adminId,
        members: room.members.map(m => ({
          id: m.userId._id,
          username: m.userId.username,
          email: m.userId.email,
          joinedAt: m.joinedAt
        }))
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get room details
router.get('/:roomId', verifyToken, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId }).populate('members.userId', 'username email');
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!room.isMember(req.userId)) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    res.json({
      id: room._id,
      roomId: room.roomId,
      name: room.name,
      description: room.description,
      adminId: room.adminId,
      members: room.members.map(m => ({
        id: m.userId._id,
        username: m.userId.username,
        email: m.userId.email,
        publicKey: m.userId.publicKey,
        joinedAt: m.joinedAt
      })),
      createdAt: room.createdAt
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get message history
router.get('/:roomId/messages', verifyToken, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!room.isMember(req.userId)) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    const messages = await Message.find({ roomId: room._id })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      messages: messages.reverse().map(m => ({
        id: m._id,
        userId: m.userId._id,
        username: m.userId.username,
        content: m.content,
        encryptedContent: m.encryptedContent,
        nonce: m.nonce,
        senderPublicKey: m.senderPublicKey,
        createdAt: m.createdAt
      }))
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// List user's rooms
router.get('/list/myrooms', verifyToken, async (req, res) => {
  try {
    console.log('Getting rooms for userId:', req.userId);
    const rooms = await Room.find({ 'members.userId': req.userId })
      .select('roomId name description adminId createdAt members');

    console.log('Found rooms:', rooms.length);
    res.json({
      rooms: rooms.map(r => ({
        id: r._id,
        roomId: r.roomId,
        name: r.name,
        description: r.description,
        isAdmin: r.adminId.toString() === req.userId,
        memberCount: r.members.length,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    console.error('Error getting rooms:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Remove member (admin only)
router.post('/:roomId/remove-member', verifyToken, async (req, res) => {
  try {
    const { memberId } = req.body;
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.adminId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only admin can remove members' });
    }

    room.removeMember(memberId);
    await room.save();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// End session - delete all messages from current session
router.post('/:roomId/end-session', verifyToken, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!room.isMember(req.userId)) {
      return res.status(403).json({ error: 'Not a member of this room' });
    }

    // Delete all messages from this room
    const deleteResult = await Message.deleteMany({ roomId: room._id });

    res.json({ 
      message: 'Session ended successfully', 
      messagesDeleted: deleteResult.deletedCount 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete room (admin only)
router.delete('/:roomId', verifyToken, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.adminId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only admin can delete room' });
    }

    // Delete all messages in the room
    await Message.deleteMany({ roomId: room._id });

    // Delete the room
    await Room.deleteOne({ _id: room._id });

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
