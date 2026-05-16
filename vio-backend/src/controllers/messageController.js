const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { getIo, emitToUser, emitToChat } = require('../websocket/socketManager');
const { WS_EVENTS } = require('../config/constants');
const {
  validateMessageContent,
  formatMessageResponse,
  getAttachmentType,
  createAttachmentObject,
} = require('../utils/helpers');
const { notifyNewMessage } = require('../services/notificationService');

// ─── Helper: get userId consistently ───────────────────
const getUserId = (req) => (req.user.userId || req.user.id).toString();

// ─── Helper: verify chat membership ───────────────────
const verifyMembership = async (chatId, userId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) return { chat: null, error: 'Chat not found', status: 404 };

  const isMember = chat.members.some((m) => m.toString() === userId);
  if (!isMember) return { chat, error: 'Access denied. You are not a member of this chat.', status: 403 };

  return { chat, error: null, status: null };
};

/**
 * Send a message to a chat
 */
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content, attachments, messageType, topicId, replyTo } = req.body;
    const senderId = getUserId(req);

    // ── Validate chat membership ──────────────────────
    const { chat, error, status } = await verifyMembership(chatId, senderId);
    if (error) return res.status(status).json({ error });

    // ── Validate content or attachments ───────────────
    if (!validateMessageContent(content, attachments)) {
      return res.status(400).json({ error: 'Message must contain text content or at least one attachment' });
    }

    // ── Build message data ────────────────────────────
    let finalMessageType = messageType || 'text';
    const attachmentsArray = Array.isArray(attachments) ? attachments : [];

    if (attachmentsArray.length > 0) {
      const types = attachmentsArray.map(a => a.type);
      if (types.every(t => t === 'image' || t === 'video')) {
        finalMessageType = 'media';
      } else if (types.some(t => t === 'audio')) {
        finalMessageType = 'audio';
      } else {
        finalMessageType = 'file';
      }
    }

    const messageData = {
      chatId,
      senderId,
      content: content || '',
      messageType: finalMessageType,
      attachments: attachmentsArray,
      replyTo: replyTo || null,
    };

    // Add topicId only for supergroups
    if (topicId && chat.chatType === 'supergroup') {
      const topicExists = chat.topics.id(topicId);
      if (!topicExists) {
        return res.status(404).json({ error: 'Topic not found in this supergroup' });
      }
      messageData.topicId = topicId;
    }

    // ── Save to database ──────────────────────────────
    const message = await Message.create(messageData);
    const populated = await message.populate('senderId', 'username avatar status');

    // ── Emit via WebSocket ────────────────────────────
    // 1. Broadcast to chat room (everyone viewing this chat gets it)
    emitToChat(chatId, WS_EVENTS.RECEIVE_MESSAGE, populated);

    // 2. Send personal notification to every member NOT the sender
    //    (so they see badge updates even if not viewing this chat)
    chat.members.forEach((memberId) => {
      if (memberId.toString() !== senderId) {
        emitToUser(memberId.toString(), WS_EVENTS.MESSAGE_NOTIFICATION, {
          chatId,
          message: populated,
        });
      }
    });

    // 3. Confirm delivery back to sender
    emitToUser(senderId, WS_EVENTS.MESSAGE_DELIVERED, {
      messageId: populated._id,
      chatId,
      deliveredAt: new Date().toISOString(),
    });

    // 4. Persist notifications for each recipient
    const recipientIds = chat.members.filter(m => m.toString() !== senderId);
    recipientIds.forEach(rid => {
      notifyNewMessage(
        rid,
        chatId,
        populated._id,
        populated.senderId?.username || 'Someone'
      ).catch((err) => console.error('notifyNewMessage error:', err.message));
    });

    res.status(201).json(populated);
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ error: 'An error occurred while sending the message' });
  }
};

/**
 * Fetch messages for a chat with pagination
 */
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, skip = 0, topicId } = req.query;
    const userId = getUserId(req);

    // ── Verify membership ─────────────────────────────
    const { error, status } = await verifyMembership(chatId, userId);
    if (error) return res.status(status).json({ error });

    // ── Build query ───────────────────────────────────
    const query = { chatId };
    if (topicId) query.topicId = topicId;

    const total = await Message.countDocuments(query);

    const messages = await Message.find(query)
      .populate('senderId', 'username avatar status')
      .populate({
        path: 'replyTo',
        populate: { path: 'senderId', select: 'username avatar' },
      })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    res.status(200).json({
      messages: messages.reverse(), // chronological order
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + parseInt(limit) < total,
      },
    });
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ error: 'An error occurred while fetching messages' });
  }
};

/**
 * Edit a message
 */
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { newContent } = req.body;
    const userId = getUserId(req);

    if (!newContent || newContent.trim().length === 0) {
      return res.status(400).json({ error: 'New content cannot be empty' });
    }

    if (newContent.length > 4000) {
      return res.status(400).json({ error: 'Content cannot exceed 4000 characters' });
    }

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    // Only the sender can edit
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ error: 'Permission denied. Only the sender can edit this message.' });
    }

    message.content = newContent;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    const populated = await message.populate('senderId', 'username avatar');

    // ── Emit via WebSocket ────────────────────────────
    emitToChat(message.chatId.toString(), WS_EVENTS.MESSAGE_UPDATED, {
      messageId: populated._id,
      chatId: message.chatId.toString(),
      newContent: populated.content,
      isEdited: true,
      editedAt: populated.editedAt,
      sender: populated.senderId,
    });

    res.status(200).json(populated);
  } catch (error) {
    console.error('editMessage error:', error);
    res.status(500).json({ error: 'An error occurred while editing the message' });
  }
};

/**
 * Delete a message
 */
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({message: 'Not found'});
    
    const userId = (req.user.userId || req.user.id).toString();
    // Check if user is sender
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({message: 'Not authorized'});
    }
    
    const chatId = message.chatId.toString();
    const messageId = message._id.toString();
    
    await Message.deleteOne({_id: req.params.messageId});
    
    // Notify via WebSocket
    emitToChat(chatId, WS_EVENTS.MESSAGE_REMOVED, { messageId, chatId });
    
    res.json({success: true});
  } catch (e) {
    console.error('Delete failed:', e);
    res.status(500).json({message: 'Delete failed'});
  }
};

/**
 * React to a message (toggle emoji reaction)
 */
exports.reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = getUserId(req);

    if (!emoji || emoji.trim().length === 0) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    // Verify user is a member of the chat
    const { error, status } = await verifyMembership(message.chatId, userId);
    if (error) return res.status(status).json({ error });

    // Find existing reaction for this emoji
    const existingReaction = message.reactions.find((r) => r.emoji === emoji);

    if (existingReaction) {
      const alreadyReacted = existingReaction.userIds.some((id) => id.toString() === userId);
      if (alreadyReacted) {
        // Remove user from this reaction
        existingReaction.userIds = existingReaction.userIds.filter((id) => id.toString() !== userId);
        // Remove the reaction object if no users left
        if (existingReaction.userIds.length === 0) {
          message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
        }
      } else {
        // Add user to this reaction
        existingReaction.userIds.push(userId);
      }
    } else {
      // Create new reaction entry
      message.reactions.push({ emoji, userIds: [userId] });
    }

    await message.save();

    // ── Emit via WebSocket ────────────────────────────
    emitToChat(message.chatId.toString(), WS_EVENTS.REACTION_UPDATE, {
      messageId,
      chatId: message.chatId.toString(),
      reactions: message.reactions,
    });

    res.status(200).json(message.reactions);
  } catch (error) {
    console.error('reactToMessage error:', error);
    res.status(500).json({ error: 'An error occurred while reacting to the message' });
  }
};

/**
 * Upload a file attachment (returns file metadata to be used in sendMessage)
 */
exports.sendAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const attachment = createAttachmentObject(req.file);

    res.status(200).json(attachment);
  } catch (error) {
    console.error('sendAttachment error:', error);
    res.status(500).json({ error: 'An error occurred while uploading the attachment' });
  }
};

/**
 * Get messages for a specific topic within a supergroup
 */
exports.getMessagesByTopic = async (req, res) => {
  try {
    const { chatId, topicId } = req.params;
    const { limit = 50, skip = 0 } = req.query;
    const userId = getUserId(req);

    // ── Verify membership and supergroup ──────────────
    const { chat, error, status } = await verifyMembership(chatId, userId);
    if (error) return res.status(status).json({ error });

    if (chat.chatType !== 'supergroup') {
      return res.status(400).json({ error: 'Topics are only available in supergroups' });
    }

    const topicExists = chat.topics.id(topicId);
    if (!topicExists) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const total = await Message.countDocuments({ chatId, topicId });

    const messages = await Message.find({ chatId, topicId })
      .populate('senderId', 'username avatar status')
      .populate({
        path: 'replyTo',
        populate: { path: 'senderId', select: 'username avatar' },
      })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    res.status(200).json({
      topic: topicExists,
      messages: messages.reverse(),
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + parseInt(limit) < total,
      },
    });
  } catch (error) {
    console.error('getMessagesByTopic error:', error);
    res.status(500).json({ error: 'An error occurred while fetching topic messages' });
  }
};

/**
 * Search messages by text content within a chat
 */
exports.searchMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { q, topicId } = req.query;
    const userId = getUserId(req);

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // ── Verify membership ─────────────────────────────
    const { error, status } = await verifyMembership(chatId, userId);
    if (error) return res.status(status).json({ error });

    // ── Build query ───────────────────────────────────
    const query = {
      chatId,
      content: { $regex: q.trim(), $options: 'i' },
    };
    if (topicId) query.topicId = topicId;

    const messages = await Message.find(query)
      .populate('senderId', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(30);

    if (messages.length === 0) {
      return res.status(404).json({ error: 'No messages matching your search were found' });
    }

    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error('searchMessages error:', error);
    res.status(500).json({ error: 'An error occurred while searching messages' });
  }
};
