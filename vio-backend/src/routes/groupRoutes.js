const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Chat = require('../models/Chat');
const mongoose = require('mongoose');

// POST /api/groups/group
router.post('/group', verifyToken, async (req, res) => {
  try {
    const { groupName, description, memberIds } = req.body;
    
    if (!groupName) {
      return res.status(400).json({ message: 'Group name required' });
    }
    
    const chat = new Chat({
      chatName: groupName,
      description: description || '',
      chatType: 'group',
      members: [req.user.userId || req.user.id, ...memberIds],
      admin: req.user.userId || req.user.id,
      createdAt: new Date()
    });
    
    await chat.save();
    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    console.error('Group creation error:', error);
    res.status(500).json({ message: 'Failed to create group' });
  }
});

// POST /api/groups/supergroup
router.post('/supergroup', verifyToken, async (req, res) => {
  try {
    const { groupName, description, memberIds, topics } = req.body;
    
    if (!groupName || !topics || topics.length === 0) {
      return res.status(400).json({ message: 'Group name and topics required' });
    }
    
    // Topics in Chat model are a sub-schema that auto-generates _id (ObjectId)
    const topicsWithIds = topics.map(t => ({
      name: t.name,
      description: t.description || ''
    }));
    
    const chat = new Chat({
      chatName: groupName,
      description: description || '',
      chatType: 'supergroup',
      members: [req.user.userId || req.user.id, ...memberIds],
      admin: req.user.userId || req.user.id,
      topics: topicsWithIds,
      createdAt: new Date()
    });
    
    if (chat.topics && chat.topics.length > 0) {
      chat.currentTopic = chat.topics[0]._id;
    }
    
    await chat.save();
    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    console.error('Supergroup creation error:', error);
    res.status(500).json({ message: 'Failed to create supergroup' });
  }
});

module.exports = router;
