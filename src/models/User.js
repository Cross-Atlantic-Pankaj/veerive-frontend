const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Only required if not signing in with Google
    }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows users without Google ID
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String // Store Google profile picture
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
