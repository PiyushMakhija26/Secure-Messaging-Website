const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const secret = process.env.JWT_SECRET || 'mysecretkey123';
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get current user profile - MUST come before /:userId route
router.get('/profile/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      publicKey: user.publicKey,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user public key
router.get('/:userId/public-key', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('publicKey username');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: user._id,
      username: user.username,
      publicKey: user.publicKey
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
