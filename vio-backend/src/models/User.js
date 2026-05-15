const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Auto-generated unique user ID
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      required: true,
      auto: true,
    },
    // Required, unique username with minimum 3 characters
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      index: true,
    },
    // Required, unique email stored in lowercase
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    // Hashed password
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't return password by default in queries
    },
    // URL to profile picture
    avatar: {
      type: String,
      default: '',
    },
    // User presence status
    status: {
      type: String,
      enum: ['online', 'offline', 'away'],
      default: 'offline',
    },
    // User description or bio (max 150 chars)
    statusMessage: {
      type: String,
      maxlength: [150, 'Status message cannot exceed 150 characters'],
      default: '',
    },
    // Optional phone number
    phoneNumber: {
      type: String,
      default: '',
    },
    // Timestamp of when the user was last active
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Automatically manage createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Pre-save hook to hash password using bcryptjs
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare candidate password with stored hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
