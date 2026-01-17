const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const RoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  encryptionType: {
    type: String,
    default: 'tweetnacl',
    enum: ['tweetnacl']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
RoomSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    next();
  } catch (error) {
    next(error);
  }
});

RoomSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

RoomSchema.methods.addMember = function(userId) {
  const userIdStr = userId.toString();
  if (!this.members.some(m => m.userId.toString() === userIdStr)) {
    this.members.push({ userId: userId });
    console.log(`Added member ${userIdStr} to room ${this.roomId}`);
  }
};

RoomSchema.methods.removeMember = function(userId) {
  const userIdStr = userId.toString();
  this.members = this.members.filter(m => m.userId.toString() !== userIdStr);
};

RoomSchema.methods.isMember = function(userId) {
  const userIdStr = String(userId);
  const isMem = this.members.some(m => {
    const memberId = String(m.userId._id || m.userId);
    console.log(`Comparing: "${userIdStr}" vs "${memberId}"`);
    return memberId === userIdStr;
  });
  console.log(`Checking if ${userIdStr} is member of room ${this.roomId}: ${isMem} (total members: ${this.members.length})`);
  return isMem;
};

module.exports = mongoose.model('Room', RoomSchema);
