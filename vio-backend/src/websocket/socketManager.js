/**
 * VioApp — WebSocket Manager
 *
 * Initialises Socket.IO, authenticates connections via JWT,
 * manages presence tracking, and exposes helper functions
 * for emitting events from controllers.
 *
 * Supports multiple concurrent connections per user.
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Call = require('../models/Call');
const { WS_EVENTS } = require('../config/constants');

let io;

// userId -> Set<socketId>  (supports multiple tabs / devices)
const connectedUsers = new Map();

// ─── Public helpers (used by controllers) ──────────────

/**
 * Returns the Map of connected users (userId → Set<socketId>)
 */
const getConnectedUsers = () => connectedUsers;

/**
 * Emit an event to a specific user across all their connections
 */
const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(userId.toString()).emit(event, data);
};

/**
 * Emit an event to every socket in a chat room
 */
const emitToChat = (chatId, event, data) => {
  if (!io) return;
  io.to(chatId.toString()).emit(event, data);
};

/**
 * Returns the current io instance (for direct use in controllers)
 */
const getIo = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};

/**
 * Check whether a user is connected right now
 */
const getUserStatus = (userId) => {
  const sockets = connectedUsers.get(userId.toString());
  return sockets && sockets.size > 0 ? 'online' : 'offline';
};

// ─── Init ──────────────────────────────────────────────

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // ── Authentication middleware ──────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication error: token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = (decoded.userId || decoded.id).toString();
      next();
    } catch (err) {
      return next(new Error('Authentication error: invalid token'));
    }
  });

  // ── Connection handler ────────────────────────────
  io.on(WS_EVENTS.CONNECTION, (socket) => {
    const userId = socket.userId;
    console.log(`🔌 [WS] Connected: userId=${userId}  socketId=${socket.id}`);

    // ─ Register in connected-users map ─────────────
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId).add(socket.id);

    // Join personal room so we can emitToUser later
    socket.join(userId);

    // Mark online in DB and broadcast status
    User.findByIdAndUpdate(userId, { status: 'online' }).catch(() => {});
    socket.broadcast.emit(WS_EVENTS.USER_STATUS_CHANGED, { userId, status: 'online' });

    // ────────────────────────────────────────────────
    // CHAT EVENTS
    // ────────────────────────────────────────────────

    // ── join-chat ────────────────────────────────────
    socket.on(WS_EVENTS.JOIN_CHAT, async (data) => {
      try {
        const chatId = typeof data === 'object' ? data.chatId : data;
        if (!chatId) return;

        const chat = await Chat.findById(chatId);
        if (!chat || !chat.members.some((m) => m.toString() === userId)) {
          return socket.emit('error', { message: 'Not a member of this chat' });
        }

        socket.join(chatId.toString());
        console.log(`💬 [WS] userId=${userId} joined chat=${chatId}`);

        socket.to(chatId.toString()).emit(WS_EVENTS.USER_JOINED, {
          userId,
          chatId: chatId.toString(),
        });
      } catch (err) {
        console.error('[WS] join-chat error:', err.message);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // ── leave-chat ───────────────────────────────────
    socket.on(WS_EVENTS.LEAVE_CHAT, (data) => {
      const chatId = typeof data === 'object' ? data.chatId : data;
      if (!chatId) return;
      socket.leave(chatId.toString());
      console.log(`🚪 [WS] userId=${userId} left chat=${chatId}`);

      socket.to(chatId.toString()).emit(WS_EVENTS.USER_LEFT, {
        userId,
        chatId: chatId.toString(),
      });
    });

    // ────────────────────────────────────────────────
    // MESSAGE EVENTS
    // ────────────────────────────────────────────────

    // ── new-message (client-side optimistic send) ───
    socket.on(WS_EVENTS.NEW_MESSAGE, (messageData) => {
      try {
        if (!messageData || !messageData.chatId) return;
        const chatId = messageData.chatId.toString();

        io.to(chatId).emit(WS_EVENTS.RECEIVE_MESSAGE, messageData);

        socket.emit(WS_EVENTS.MESSAGE_DELIVERED, {
          messageId: messageData._id || messageData.messageId,
          chatId,
          deliveredAt: new Date().toISOString(),
        });

        console.log(`📨 [WS] message in chat=${chatId} from userId=${userId}`);
      } catch (err) {
        console.error('[WS] new-message error:', err.message);
      }
    });

    // ── typing ───────────────────────────────────────
    socket.on(WS_EVENTS.TYPING_START, (data) => {
      const { chatId, username } = typeof data === 'object' ? data : { chatId: data };
      if (!chatId) return;
      console.log(`✍️ [WS] userId=${userId} (${username}) started typing in chat=${chatId}`);
      socket.to(chatId.toString()).emit(WS_EVENTS.USER_TYPING, {
        userId,
        username: username || 'Someone',
        chatId: chatId.toString(),
      });
    });

    socket.on(WS_EVENTS.TYPING_STOP, (data) => {
      const chatId = typeof data === 'object' ? data.chatId : data;
      if (!chatId) return;
      console.log(`🛑 [WS] userId=${userId} stopped typing in chat=${chatId}`);
      socket.to(chatId.toString()).emit(WS_EVENTS.USER_STOPPED_TYPING, {
        userId,
        chatId: chatId.toString(),
      });
    });

    // ── message-edited ──────────────────────────────
    socket.on(WS_EVENTS.MESSAGE_EDITED, ({ messageId, newContent, chatId }) => {
      if (!chatId) return;
      socket.to(chatId.toString()).emit(WS_EVENTS.MESSAGE_UPDATED, {
        messageId,
        newContent,
        chatId: chatId.toString(),
        editedAt: new Date().toISOString(),
      });
    });

    // ── message-deleted ─────────────────────────────
    socket.on(WS_EVENTS.MESSAGE_DELETED, ({ messageId, chatId }) => {
      if (!chatId) return;
      socket.to(chatId.toString()).emit(WS_EVENTS.MESSAGE_REMOVED, {
        messageId,
        chatId: chatId.toString(),
      });
    });

    // ── reaction-added ──────────────────────────────
    socket.on(WS_EVENTS.REACTION_ADDED, ({ messageId, emoji, chatId, reactions }) => {
      if (!chatId) return;
      socket.to(chatId.toString()).emit(WS_EVENTS.REACTION_UPDATE, {
        messageId,
        emoji,
        userId,
        chatId: chatId.toString(),
        reactions,
      });
    });

    // ────────────────────────────────────────────────
    // STATUS EVENTS
    // ────────────────────────────────────────────────

    socket.on(WS_EVENTS.STATUS_CHANGED, async ({ status }) => {
      try {
        const allowed = ['online', 'offline', 'away'];
        if (!allowed.includes(status)) return;

        await User.findByIdAndUpdate(userId, { status, lastSeen: new Date() });
        io.emit(WS_EVENTS.USER_STATUS_CHANGED, { userId, status });
        console.log(`🟢 [WS] userId=${userId} status → ${status}`);
      } catch (err) {
        console.error('[WS] status-changed error:', err.message);
      }
    });

    // ────────────────────────────────────────────────
    // TOPIC EVENTS (supergroups)
    // ────────────────────────────────────────────────

    socket.on(WS_EVENTS.TOPIC_SWITCHED, ({ chatId, topicId }) => {
      if (!chatId || !topicId) return;
      socket.to(chatId.toString()).emit(WS_EVENTS.TOPIC_CHANGED, {
        userId,
        chatId: chatId.toString(),
        topicId,
      });
    });

    // ────────────────────────────────────────────────
    // CALL EVENTS (WebRTC Signaling)
    // ────────────────────────────────────────────────

    /**
     * initiate-call
     * Client tells the server it wants to ring a user.
     * Server validates the call record exists and emits incoming-call.
     */
    socket.on(WS_EVENTS.INITIATE_CALL, async ({ callId, callType, recipientId }) => {
      try {
        if (!callId) return;

        const call = await Call.findById(callId)
          .populate('initiatorId', 'username avatar');

        if (!call) {
          return socket.emit('error', { message: 'Call not found' });
        }

        if (call.status !== 'ringing') {
          return socket.emit('error', { message: `Call is not in ringing state (${call.status})` });
        }

        // Emit to the specific recipient or all participants
        const targets = recipientId
          ? [recipientId]
          : call.participantIds.map((p) => p.toString());

        targets.forEach((targetId) => {
          emitToUser(targetId, WS_EVENTS.INCOMING_CALL, {
            callId: call._id,
            callType: call.callType,
            chatId: call.chatId.toString(),
            initiator: {
              userId: call.initiatorId._id || call.initiatorId,
              username: call.initiatorId.username,
              avatar: call.initiatorId.avatar,
            },
          });
        });

        console.log(`📞 [WS] initiate-call: callId=${callId} by=${userId}`);
      } catch (err) {
        console.error('[WS] initiate-call error:', err.message);
        socket.emit('error', { message: 'Failed to initiate call' });
      }
    });

    /**
     * accept-call
     * Participant accepts; server updates DB and notifies everyone.
     */
    socket.on(WS_EVENTS.ACCEPT_CALL, async ({ callId }) => {
      try {
        if (!callId) return;

        const call = await Call.findById(callId);
        if (!call) return socket.emit('error', { message: 'Call not found' });

        if (call.status !== 'ringing') {
          return socket.emit('error', { message: 'Call is no longer ringing' });
        }

        call.status = 'active';
        call.startTime = new Date();
        await call.save();

        // Notify initiator
        emitToUser(call.initiatorId.toString(), WS_EVENTS.CALL_ACCEPTED, {
          callId: call._id,
          acceptedBy: userId,
        });

        // Notify other participants
        call.participantIds.forEach((pid) => {
          if (pid.toString() !== userId) {
            emitToUser(pid.toString(), WS_EVENTS.CALL_ACCEPTED, {
              callId: call._id,
              acceptedBy: userId,
            });
          }
        });

        console.log(`✅ [WS] accept-call: callId=${callId} by=${userId}`);
      } catch (err) {
        console.error('[WS] accept-call error:', err.message);
        socket.emit('error', { message: 'Failed to accept call' });
      }
    });

    /**
     * reject-call
     * Participant rejects; server updates DB and notifies initiator.
     */
    socket.on(WS_EVENTS.REJECT_CALL, async ({ callId, reason }) => {
      try {
        if (!callId) return;

        const call = await Call.findById(callId);
        if (!call) return socket.emit('error', { message: 'Call not found' });

        if (call.status !== 'ringing') {
          return socket.emit('error', { message: 'Call is no longer ringing' });
        }

        call.status = 'rejected';
        call.endTime = new Date();
        call.endReason = reason || 'declined';
        await call.save();

        emitToUser(call.initiatorId.toString(), WS_EVENTS.CALL_REJECTED, {
          callId: call._id,
          rejectedBy: userId,
          reason: call.endReason,
        });

        console.log(`🚫 [WS] reject-call: callId=${callId} by=${userId}`);
      } catch (err) {
        console.error('[WS] reject-call error:', err.message);
        socket.emit('error', { message: 'Failed to reject call' });
      }
    });

    /**
     * end-call
     * Either side ends the call; server calculates duration.
     */
    socket.on(WS_EVENTS.END_CALL, async ({ callId }) => {
      try {
        if (!callId) return;

        const call = await Call.findById(callId);
        if (!call) return socket.emit('error', { message: 'Call not found' });

        if (call.status === 'ended' || call.status === 'missed' || call.status === 'rejected') {
          return; // Already finished, no-op
        }

        call.status = 'ended';
        call.endTime = new Date();
        await call.save(); // pre-save hook calculates duration

        const allUsers = [
          call.initiatorId.toString(),
          ...call.participantIds.map((p) => p.toString()),
        ];

        allUsers.forEach((uid) => {
          if (uid !== userId) {
            emitToUser(uid, WS_EVENTS.CALL_ENDED, {
              callId: call._id,
              endedBy: userId,
              duration: call.duration,
            });
          }
        });

        console.log(`📵 [WS] end-call: callId=${callId} duration=${call.duration}s`);
      } catch (err) {
        console.error('[WS] end-call error:', err.message);
        socket.emit('error', { message: 'Failed to end call' });
      }
    });

    /**
     * call-signaling
     * Forwards WebRTC ICE candidates / SDP offers between peers.
     */
    socket.on(WS_EVENTS.CALL_SIGNALING, async ({ callId, signalingData, targetParticipantId }) => {
      try {
        if (!callId || !signalingData || !targetParticipantId) return;

        const call = await Call.findById(callId);
        if (!call) return socket.emit('error', { message: 'Call not found' });

        if (call.status !== 'active' && call.status !== 'ringing') {
          return socket.emit('error', { message: 'Call is not active' });
        }

        // Verify sender is part of the call
        const allIds = [
          call.initiatorId.toString(),
          ...call.participantIds.map((p) => p.toString()),
        ];
        if (!allIds.includes(userId)) {
          return socket.emit('error', { message: 'You are not part of this call' });
        }

        // Forward signaling data to the target peer
        emitToUser(targetParticipantId, WS_EVENTS.CALL_SIGNALING, {
          callId: call._id,
          from: userId,
          signalingData,
        });
      } catch (err) {
        console.error('[WS] call-signaling error:', err.message);
      }
    });

    // ────────────────────────────────────────────────
    // NOTIFICATION EVENTS
    // ────────────────────────────────────────────────

    /**
     * notification-read
     * When a user reads a notification on one device,
     * sync the read state to their other connected devices.
     */
    socket.on(WS_EVENTS.NOTIFICATION_READ, async ({ notificationId }) => {
      try {
        if (!notificationId) return;

        const Notification = require('../models/Notification');
        const notification = await Notification.findById(notificationId);
        if (!notification) return;
        if (notification.recipientId.toString() !== userId) return;

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        // Sync to other devices of same user (exclude current socket)
        socket.to(userId).emit(WS_EVENTS.NOTIFICATION_READ, {
          notificationId,
          readAt: notification.readAt,
        });
      } catch (err) {
        console.error('[WS] notification-read error:', err.message);
      }
    });

    /**
     * notification-deleted
     * When a user deletes a notification on one device,
     * remove it from their other devices too.
     */
    socket.on(WS_EVENTS.NOTIFICATION_DELETED, async ({ notificationId }) => {
      try {
        if (!notificationId) return;

        const Notification = require('../models/Notification');
        const notification = await Notification.findById(notificationId);
        if (!notification) return;
        if (notification.recipientId.toString() !== userId) return;

        await Notification.findByIdAndDelete(notificationId);

        // Sync to other devices
        socket.to(userId).emit(WS_EVENTS.NOTIFICATION_DELETED, {
          notificationId,
        });
      } catch (err) {
        console.error('[WS] notification-deleted error:', err.message);
      }
    });

    // ────────────────────────────────────────────────
    // DISCONNECT
    // ────────────────────────────────────────────────

    socket.on('disconnecting', () => {
      const rooms = Array.from(socket.rooms);
      rooms.forEach((room) => {
        if (room !== socket.id && room !== userId) {
          socket.to(room).emit(WS_EVENTS.USER_LEFT, {
            userId,
            chatId: room,
          });
        }
      });
    });

    socket.on(WS_EVENTS.DISCONNECT, async () => {
      console.log(`👋 [WS] Disconnected: userId=${userId}  socketId=${socket.id}`);

      const sockets = connectedUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          connectedUsers.delete(userId);
          try {
            await User.findByIdAndUpdate(userId, {
              status: 'offline',
              lastSeen: new Date(),
            });
          } catch (_) {}
          socket.broadcast.emit(WS_EVENTS.USER_STATUS_CHANGED, {
            userId,
            status: 'offline',
          });
        }
      }
    });

    // ── Global error handler for this socket ─────────
    socket.on('error', (err) => {
      console.error(`❌ [WS] Error for userId=${userId}:`, err.message);
      socket.emit('error', { message: 'An unexpected error occurred' });
    });
  });
};

module.exports = {
  initSocket,
  getIo,
  getConnectedUsers,
  emitToUser,
  emitToChat,
  getUserStatus,
};
