const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');

// All chat routes require authentication
router.use(verifyToken);

// ─── Creation ─────────────────────────────────────────
router.post('/direct', chatController.createDirectChat);
router.post('/group', chatController.createGroup);
router.post('/supergroup', chatController.createSupergroup);

// ─── Retrieval ────────────────────────────────────────
router.get('/', chatController.getChatList);
router.get('/:chatId', chatController.getChatDetails);

// ─── Updates & Management ─────────────────────────────
router.put('/:chatId', chatController.updateChatInfo);
router.post('/:chatId/members', chatController.addMembersToChat);
router.delete('/:chatId/members/:memberId', chatController.removeMemberFromChat);
router.delete('/:chatId/leave', chatController.leaveChat);
router.delete('/:chatId/clear', chatController.clearChat);

// ─── Supergroup Topics ────────────────────────────────
router.post('/:chatId/topics', chatController.addTopic);
router.put('/:chatId/topics/:topicId', chatController.switchTopic);

module.exports = router;
