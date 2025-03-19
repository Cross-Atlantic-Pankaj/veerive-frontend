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
      return !this.googleId && !this.linkedinId;
    }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true 
  },
  linkedinId: {
    type: String,  
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String 
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