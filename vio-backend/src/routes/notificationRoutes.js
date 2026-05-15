const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

// All notification routes require authentication
router.use(verifyToken);

// GET /api/notifications — List notifications (optional ?isRead=true|false)
router.get('/', notificationController.getNotifications);

// GET /api/notifications/unread/count — Unread badge count
router.get('/unread/count', notificationController.getUnreadCount);

// PUT /api/notifications/read-all — Mark all as read (before :notificationId to avoid collision)
router.put('/read-all', notificationController.markAllAsRead);

// PUT /api/notifications/:notificationId/read — Mark single as read
router.put('/:notificationId/read', notificationController.markAsRead);

// DELETE /api/notifications/:notificationId — Delete single
router.delete('/:notificationId', notificationController.deleteNotification);

// DELETE /api/notifications — Delete all
router.delete('/', notificationController.deleteAllNotifications);

module.exports = router;
