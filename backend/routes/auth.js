const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nacl = require('tweetnacl');
const { randomBytes } = require('crypto');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('Register attempt:', { username, email, passwordLength: password?.length });

    if (!username || !email || !password) {
      console.log('Missing fields:', { username: !!username, email: !!email, password: !!password });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('User already exists:', existingUser.email || existingUser.username);
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    // Generate encryption keypair for user
    const keyPair = nacl.box.keyPair();
    const publicKey = Buffer.from(keyPair.publicKey).toString('base64');

    const user = new User({
      username,
      email,
      passwordHash: password,
      publicKey
    });

    await user.save();
    console.log('User created:', user._id);

    const secret = process.env.JWT_SECRET || 'mysecretkey123';
    const token = jwt.sign({ userId: user._id }, secret);
    console.log('Token created with secret:', secret.substring(0, 10) + '...');
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        publicKey: user.publicKey
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || 'mysecretkey123';
    const token = jwt.sign({ userId: user._id }, secret);
    console.log('Token created with secret:', secret.substring(0, 10) + '...');
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        publicKey: user.publicKey
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Verify token
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const secret = process.env.JWT_SECRET || 'mysecretkey123';
    console.log('Verifying token with secret:', secret.substring(0, 10) + '...');
    const decoded = jwt.verify(token, secret);
    res.json({ valid: true, userId: decoded.userId });
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
