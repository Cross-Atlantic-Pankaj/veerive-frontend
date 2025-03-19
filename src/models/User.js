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
      return !this.googleId && !this.linkedinId; // Required only if no social login
    }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows users without Google ID
  },
  linkedinId: {
    type: String,  // 🔥 New field for LinkedIn authentication
    unique: true,
    sparse: true // Allows users without LinkedIn ID
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String // Stores Google/LinkedIn profile picture
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