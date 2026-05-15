const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middleware/auth');
const { validateMessage } = require('../middleware/validateMessage');
const upload = require('../middleware/upload');

// All message routes require authentication
router.use(verifyToken);

// POST /api/messages — Send a new message
router.post('/', validateMessage, messageController.sendMessage);

// GET /api/messages/:chatId — Get messages for a chat (with pagination)
router.get('/:chatId', messageController.getMessages);

// PUT /api/messages/:messageId — Edit a message
router.put('/:messageId', messageController.editMessage);

// DELETE /api/messages/:messageId — Delete a message
router.delete('/:messageId', messageController.deleteMessage);

// POST /api/messages/:messageId/react — React to a message
router.post('/:messageId/react', messageController.reactToMessage);

// POST /api/messages/attachment/upload — Upload a file attachment
router.post('/attachment/upload', upload.single('message_attachment'), messageController.sendAttachment);

// GET /api/messages/:chatId/topic/:topicId — Messages by topic in supergroup
router.get('/:chatId/topic/:topicId', messageController.getMessagesByTopic);

// GET /api/messages/:chatId/search — Search messages within a chat
router.get('/:chatId/search', messageController.searchMessages);

module.exports = router;
