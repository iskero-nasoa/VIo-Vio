const mongoose = require('mongoose');

// Sub-schema for topics (used in supergroups)
const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { _id: true } // Auto-generate IDs for topics
);

const chatSchema = new mongoose.Schema(
  {
    // Auto-generated unique chat ID
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      required: true,
      auto: true,
    },
    // Name of the chat (required for group and supergroup)
    chatName: {
      type: String,
      trim: true,
      required: function() {
        return this.chatType === 'group' || this.chatType === 'supergroup';
      },
    },
    // Optional description for groups/supergroups
    description: {
      type: String,
      default: '',
    },
    // Type of chat
    chatType: {
      type: String,
      enum: ['direct', 'group', 'supergroup'],
      default: 'direct',
    },
    // Array of references to Users who are members of this chat
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Reference to User who is the admin of the group/supergroup
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Array of topics (only applicable for supergroups)
    topics: [topicSchema],
    // The currently active topic in a supergroup
    currentTopic: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    // URL to group avatar
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    // Automatically manage createdAt and updatedAt timestamps
    timestamps: true,
  }
);

module.exports = mongoose.model('Chat', chatSchema);
