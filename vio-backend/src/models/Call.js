const mongoose = require('mongoose');

const callSchema = new mongoose.Schema(
  {
    // Auto-generated unique call ID
    callId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      required: true,
      auto: true,
    },
    // Type of the call (audio only)
    callType: {
      type: String,
      enum: ['audio'],
      required: true,
      default: 'audio',
    },
    // Reference to the User who initiated the call
    initiatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Array of references to Users participating in the call
    participantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Reference to the Chat where this call took place
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    // Timestamp indicating when the call was started (set when accepted)
    startTime: {
      type: Date,
      default: null,
    },
    // Timestamp indicating when the call ended (null if ongoing)
    endTime: {
      type: Date,
      default: null,
    },
    // Duration of the call in seconds (calculated on end)
    duration: {
      type: Number,
      default: 0,
    },
    // Current status of the call
    status: {
      type: String,
      enum: {
        values: ['ringing', 'active', 'ended', 'missed', 'rejected'],
        message: '{VALUE} is not a valid call status',
      },
      default: 'ringing',
    },
    // Optional reason for rejection/end
    endReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Pre-save hook to automatically calculate duration if endTime is set
callSchema.pre('save', function (next) {
  if (this.isModified('endTime') && this.endTime && this.startTime) {
    this.duration = Math.floor((this.endTime.getTime() - this.startTime.getTime()) / 1000);
  }
  next();
});

// Compound index for duplicate-call prevention queries
callSchema.index({ initiatorId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Call', callSchema);
