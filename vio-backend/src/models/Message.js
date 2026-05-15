const mongoose = require('mongoose');

// Sub-schema for message attachments
const attachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'file'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  size: {
    type: Number, // File size in bytes
    required: true,
  },
});

// Sub-schema for message reactions
const reactionSchema = new mongoose.Schema({
  emoji: {
    type: String,
    required: true,
  },
  userIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

const messageSchema = new mongoose.Schema(
  {
    // Auto-generated unique message ID
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      required: true,
      auto: true,
    },
    // Reference to the Chat this message belongs to
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    // Reference to the User who sent this message
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Text content of the message (can be empty if attachments are present)
    content: {
      type: String,
      default: '',
      validate: {
        validator: function(v) {
          // Message must have either content or attachments
          return (v && v.trim().length > 0) || (this.attachments && this.attachments.length > 0) || this.messageType === 'call';
        },
        message: 'Message must contain text content or attachments',
      },
    },
    // Array of file attachments
    attachments: [attachmentSchema],
    // Type of the message
    messageType: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'file', 'call'],
      default: 'text',
    },
    // Flag indicating if the message has been edited
    isEdited: {
      type: Boolean,
      default: false,
    },
    // Timestamp of when the message was last edited
    editedAt: {
      type: Date,
      default: null,
    },
    // Array of reactions to this message
    reactions: [reactionSchema],
    // Reference to another message this message is replying to
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    // Reference to a specific topic (for supergroups only)
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    // Automatically manage createdAt and updatedAt timestamps
    timestamps: true,
  }
);

module.exports = mongoose.model('Message', messageSchema);
