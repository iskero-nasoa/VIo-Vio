const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middleware/auth');
const { validateMessage } = require('../middleware/validateMessage');
const upload = require('../middleware/upload');
const Message = require('../models/Message');

// All message routes require authentication
router.use(verifyToken);

// POST /api/messages — Send a new message
router.post('/', validateMessage, messageController.sendMessage);

// GET /api/messages/:chatId — Get messages for a chat (with pagination)
router.get('/:chatId', messageController.getMessages);

// PUT /api/messages/:messageId — Edit a message
router.put('/:messageId', messageController.editMessage);

// DELETE /api/messages/:messageId — Delete a message
router.delete('/:messageId', verifyToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check authorization
    const senderId = message.senderId?._id || message.senderId;
    if (senderId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Message.findByIdAndDelete(messageId);
    return res.json({ success: true, messageId });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
});

// POST /api/messages/:messageId/react — React to a message
router.post('/:messageId/react', messageController.reactToMessage);


// GET /api/messages/:chatId/topic/:topicId — Messages by topic in supergroup
router.get('/:chatId/topic/:topicId', messageController.getMessagesByTopic);

// GET /api/messages/:chatId/search — Search messages within a chat
router.get('/:chatId/search', messageController.searchMessages);

module.exports = router;
