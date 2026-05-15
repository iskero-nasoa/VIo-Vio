const Notification = require('../models/Notification');

// ─── Helper ────────────────────────────────────────────
const getUserId = (req) => (req.user.userId || req.user.id).toString();

/**
 * Get notifications for the authenticated user
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { isRead } = req.query;

    const query = { recipientId: userId };
    if (isRead === 'true') query.isRead = true;
    if (isRead === 'false') query.isRead = false;

    const notifications = await Notification.find(query)
      .populate('senderId', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(notifications);
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ error: 'An error occurred while fetching notifications' });
  }
};

/**
 * Get count of unread notifications
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = getUserId(req);

    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      isRead: false,
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('getUnreadCount error:', error);
    res.status(500).json({ error: 'An error occurred while counting unread notifications' });
  }
};

/**
 * Mark a single notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = getUserId(req);

    const notification = await Notification.findById(notificationId);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    if (notification.recipientId.toString() !== userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({ error: 'An error occurred while marking notification as read' });
  }
};

/**
 * Mark all notifications as read for the authenticated user
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = getUserId(req);

    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('markAllAsRead error:', error);
    res.status(500).json({ error: 'An error occurred while marking all notifications as read' });
  }
};

/**
 * Delete a single notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = getUserId(req);

    const notification = await Notification.findById(notificationId);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    if (notification.recipientId.toString() !== userId) {
      return res.status(403).json({ error: 'Permission denied. You can only delete your own notifications.' });
    }

    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('deleteNotification error:', error);
    res.status(500).json({ error: 'An error occurred while deleting notification' });
  }
};

/**
 * Delete all notifications for the authenticated user
 */
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = getUserId(req);

    const result = await Notification.deleteMany({ recipientId: userId });

    res.status(200).json({
      message: 'All notifications deleted',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('deleteAllNotifications error:', error);
    res.status(500).json({ error: 'An error occurred while deleting notifications' });
  }
};
