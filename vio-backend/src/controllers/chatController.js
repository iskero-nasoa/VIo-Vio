const Chat = require('../models/Chat');
const User = require('../models/User');
const { notifyGroupInvite } = require('../services/notificationService');
const Message = require('../models/Message');
const mongoose = require('mongoose');

/**
 * Create or get a direct chat between two users
 */
exports.createDirectChat = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user.userId || req.user.id;

    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient ID is required' });
    }

    if (recipientId === currentUserId.toString()) {
      return res.status(400).json({ error: 'You cannot create a direct chat with yourself' });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }

    // Check if direct chat already exists
    let chat = await Chat.findOne({
      chatType: 'direct',
      members: { $all: [currentUserId, recipientId], $size: 2 }
    }).populate('members', 'username avatar status statusMessage');

    if (!chat) {
      chat = await Chat.create({
        chatType: 'direct',
        members: [currentUserId, recipientId]
      });
      chat = await chat.populate('members', 'username avatar status statusMessage');
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error('createDirectChat error:', error);
    res.status(500).json({ error: 'An error occurred while creating direct chat' });
  }
};

/**
 * Create a group chat
 */
exports.createGroup = async (req, res) => {
  try {
    const { groupName, description, memberIds } = req.body;
    const currentUserId = req.user.userId || req.user.id;

    if (!groupName || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: 'Group name and at least one member are required' });
    }

    // Ensure creator is in the members list
    const allMembers = [...new Set([...memberIds, currentUserId.toString()])];

    const chat = await Chat.create({
      chatName: groupName,
      description,
      chatType: 'group',
      members: allMembers,
      admin: currentUserId
    });

    const populatedChat = await chat.populate('members', 'username avatar status');

    // Notify invited members (everyone except the creator)
    const invitedIds = allMembers.filter((id) => id !== currentUserId.toString());
    if (invitedIds.length > 0) {
      invitedIds.forEach(rid => {
        notifyGroupInvite(
          rid,
          chat._id.toString(),
          groupName,
          currentUserId
        ).catch((err) => console.error('notifyGroupInvite error:', err.message));
      });
    }

    res.status(201).json(populatedChat);
  } catch (error) {
    console.error('createGroup error:', error);
    res.status(500).json({ error: 'An error occurred while creating group' });
  }
};

/**
 * Create a supergroup with topics
 */
exports.createSupergroup = async (req, res) => {
  try {
    const { groupName, description, memberIds, topics } = req.body;
    const currentUserId = req.user.userId || req.user.id;

    if (!groupName) {
      return res.status(400).json({ error: 'Supergroup name is required' });
    }

    const allMembers = Array.isArray(memberIds) 
      ? [...new Set([...memberIds, currentUserId.toString()])]
      : [currentUserId];

    const chat = await Chat.create({
      chatName: groupName,
      description,
      chatType: 'supergroup',
      members: allMembers,
      admin: currentUserId,
      topics: topics || []
    });

    // Set currentTopic to the first topic if topics were provided
    if (chat.topics && chat.topics.length > 0) {
      chat.currentTopic = chat.topics[0]._id;
      await chat.save();
    }

    res.status(201).json(chat);
  } catch (error) {
    console.error('createSupergroup error:', error);
    res.status(500).json({ error: 'An error occurred while creating supergroup' });
  }
};

/**
 * Get chat list for authenticated user
 */
exports.getChatList = async (req, res) => {
  try {
    const currentUserId = req.user.userId || req.user.id;

    // Find chats where user is a member
    let chats = await Chat.find({ members: currentUserId })
      .populate('members', 'username avatar status')
      .sort({ updatedAt: -1 });

    // Enhance chat data with last message and unread count
    const enhancedChats = await Promise.all(chats.map(async (chat) => {
      // Find last message
      const lastMessage = await Message.findOne({ chatId: chat._id })
        .sort({ createdAt: -1 })
        .populate('senderId', 'username');

      // Calculate unread count (messages sent after user last read, or simply not in readBy)
      const unreadCount = await Message.countDocuments({
        chatId: chat._id,
        senderId: { $ne: currentUserId },
        'readBy.user': { $ne: currentUserId }
      });

      // Prepare display name and avatar for direct chats
      let displayName = chat.chatName;
      let displayAvatar = chat.avatar;

      if (chat.chatType === 'direct') {
        const otherUser = chat.members.find(m => m._id.toString() !== currentUserId.toString());
        displayName = otherUser?.username || 'Unknown User';
        displayAvatar = otherUser?.avatar || '';
      }

      return {
        _id: chat._id,
        chatName: displayName,
        avatar: displayAvatar,
        chatType: chat.chatType,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          senderName: lastMessage.senderId?.username,
          createdAt: lastMessage.createdAt,
          messageType: lastMessage.messageType
        } : null,
        unreadCount,
        updatedAt: chat.updatedAt
      };
    }));

    // Re-sort by last message timestamp if available
    enhancedChats.sort((a, b) => {
      const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(a.updatedAt);
      const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(b.updatedAt);
      return dateB - dateA;
    });

    res.status(200).json(enhancedChats);
  } catch (error) {
    console.error('getChatList error:', error);
    res.status(500).json({ error: 'An error occurred while fetching chat list' });
  }
};

/**
 * Get full chat details
 */
exports.getChatDetails = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user.userId || req.user.id;

    const chat = await Chat.findById(chatId)
      .populate('members', 'username avatar status statusMessage phoneNumber lastSeen')
      .populate('admin', 'username avatar');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Verify membership
    if (!chat.members.some(m => m._id.toString() === currentUserId.toString())) {
      return res.status(403).json({ error: 'Access denied. You are not a member of this chat.' });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error('getChatDetails error:', error);
    res.status(500).json({ error: 'An error occurred while fetching chat details' });
  }
};

/**
 * Update group/supergroup info
 */
exports.updateChatInfo = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { chatName, description, avatar } = req.body;
    const currentUserId = req.user.userId || req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Verify admin permission
    if (chat.admin.toString() !== currentUserId.toString()) {
      return res.status(403).json({ error: 'Permission denied. Only admins can update chat info.' });
    }

    if (chatName) chat.chatName = chatName;
    if (description !== undefined) chat.description = description;
    if (avatar) chat.avatar = avatar;

    await chat.save();
    res.status(200).json(chat);
  } catch (error) {
    console.error('updateChatInfo error:', error);
    res.status(500).json({ error: 'An error occurred while updating chat info' });
  }
};

/**
 * Add members to a group/supergroup
 */
exports.addMembersToChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { newMemberIds } = req.body;
    const currentUserId = req.user.userId || req.user.id;

    if (!newMemberIds || !Array.isArray(newMemberIds)) {
      return res.status(400).json({ error: 'newMemberIds array is required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Verify admin permission
    if (chat.admin.toString() !== currentUserId.toString()) {
      return res.status(403).json({ error: 'Permission denied. Only admins can add members.' });
    }

    // Add members (prevent duplicates)
    const existingMembers = chat.members.map(m => m.toString());
    const membersToAdd = newMemberIds.filter(id => !existingMembers.includes(id));
    
    chat.members.push(...membersToAdd);
    await chat.save();

    const updatedChat = await chat.populate('members', 'username avatar status');
    res.status(200).json(updatedChat.members);
  } catch (error) {
    console.error('addMembersToChat error:', error);
    res.status(500).json({ error: 'An error occurred while adding members' });
  }
};

/**
 * Remove a member from a chat
 */
exports.removeMemberFromChat = async (req, res) => {
  try {
    const { chatId, memberId } = req.params;
    const currentUserId = req.user.userId || req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Verify permission: User must be admin OR removing themselves
    const isAdmin = chat.admin.toString() === currentUserId.toString();
    const isSelf = memberId === currentUserId.toString();

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    // Remove member
    chat.members = chat.members.filter(m => m.toString() !== memberId);

    // If user removed was admin, promote someone else
    if (chat.admin.toString() === memberId && chat.members.length > 0) {
      chat.admin = chat.members[0];
    }

    await chat.save();
    
    const updatedChat = await chat.populate('members', 'username avatar status');
    res.status(200).json(updatedChat);
  } catch (error) {
    console.error('removeMemberFromChat error:', error);
    res.status(500).json({ error: 'An error occurred while removing member' });
  }
};

/**
 * Leave a chat
 */
exports.leaveChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user.userId || req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Check if member
    if (!chat.members.map(m => m.toString()).includes(currentUserId.toString())) {
      return res.status(400).json({ error: 'You are not a member of this chat' });
    }

    // Remove member
    chat.members = chat.members.filter(m => m.toString() !== currentUserId.toString());

    // Promotion logic if admin leaves
    if (chat.admin && chat.admin.toString() === currentUserId.toString()) {
      if (chat.members.length > 0) {
        chat.admin = chat.members[0];
      } else {
        // Last member leaves, chat becomes empty/inactive
        // Optionally delete direct chats or empty groups
        // chat.deleteOne()
      }
    }

    await chat.save();
    res.status(200).json({ message: 'Left chat successfully' });
  } catch (error) {
    console.error('leaveChat error:', error);
    res.status(500).json({ error: 'An error occurred while leaving chat' });
  }
};

/**
 * Add a topic to a supergroup
 */
exports.addTopic = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { topicName, topicDescription } = req.body;
    const currentUserId = req.user.userId || req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    if (chat.chatType !== 'supergroup') {
      return res.status(400).json({ error: 'Only supergroups can have topics' });
    }

    // Only admin can add topics
    if (chat.admin.toString() !== currentUserId.toString()) {
      return res.status(403).json({ error: 'Permission denied. Only admins can add topics.' });
    }

    chat.topics.push({ name: topicName, description: topicDescription });
    await chat.save();

    res.status(201).json(chat.topics);
  } catch (error) {
    console.error('addTopic error:', error);
    res.status(500).json({ error: 'An error occurred while adding topic' });
  }
};

/**
 * Switch active topic in supergroup
 */
exports.switchTopic = async (req, res) => {
  try {
    const { chatId, topicId } = req.params;
    const currentUserId = req.user.userId || req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Verify membership
    if (!chat.members.map(m => m.toString()).includes(currentUserId.toString())) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    // Verify topic exists
    const topicExists = chat.topics.id(topicId);
    if (!topicExists) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    chat.currentTopic = topicId;
    await chat.save();

    res.status(200).json({ message: 'Switched topic successfully', currentTopic: topicId });
  } catch (error) {
    console.error('switchTopic error:', error);
    res.status(500).json({ error: 'An error occurred while switching topic' });
  }
};
