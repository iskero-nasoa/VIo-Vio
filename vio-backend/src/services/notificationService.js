/**
 * Notification Service
 * Precision-aligned to requested signatures.
 */

const Notification = require('../models/Notification');
const { emitToUser } = require('../websocket/socketManager');
const { WS_EVENTS } = require('../config/constants');

/**
 * Core helper to create a notification in DB
 */
exports.createNotification = async (recipientId, type, title, body, data = {}, senderId = null) => {
  try {
    return await Notification.create({
      recipientId,
      type,
      title,
      body,
      data,
      senderId,
    });
  } catch (err) {
    console.error('[NotificationService] createNotification error:', err.message);
    return null;
  }
};

/**
 * Create and Emit notification via WebSocket
 */
exports.sendNotification = async (recipientId, type, title, body, data = {}, senderId = null) => {
  const notification = await exports.createNotification(recipientId, type, title, body, data, senderId);
  if (notification) {
    emitToUser(recipientId.toString(), WS_EVENTS.NOTIFICATION, notification);
  }
  return notification;
};

/**
 * Notify about a new message
 */
exports.notifyNewMessage = async (recipientId, chatId, messageId, senderUsername) => {
  return await exports.sendNotification(
    recipientId,
    'message',
    senderUsername,
    'Sent you a message',
    { chatId, messageId }
  );
};

/**
 * Notify about an incoming call
 */
exports.notifyIncomingCall = async (recipientId, callId, initiatorUsername) => {
  return await exports.sendNotification(
    recipientId,
    'call',
    `Incoming call from ${initiatorUsername}`,
    'Ringing...',
    { callId }
  );
};

/**
 * Notify about a missed call
 */
exports.notifyMissedCall = async (recipientId, callId, initiatorUsername) => {
  return await exports.sendNotification(
    recipientId,
    'call_missed',
    `Missed call from ${initiatorUsername}`,
    new Date().toLocaleTimeString(),
    { callId }
  );
};

/**
 * Notify about a group invitation
 */
exports.notifyGroupInvite = async (recipientId, chatId, groupName, inviterId) => {
  return await exports.sendNotification(
    recipientId,
    'group_invite',
    `Invited to ${groupName}`,
    'You have been invited to join this group',
    { chatId, inviterId }
  );
};

/**
 * Notify about a user status change (Broadcast only)
 */
exports.notifyUserStatusChange = async (userId, newStatus) => {
  // Real-time broadcast (not persisted to avoid noise)
  // This event is typically broadcasted to all followers/peers
  // Logic is handled in socketManager for efficiency, 
  // but here is the service wrapper if needed.
  console.log(`🔔 Status change: user=${userId} → ${newStatus}`);
};
