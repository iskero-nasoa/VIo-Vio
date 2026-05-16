/**
 * Application Constants
 *
 * Centralised place for magic numbers, enums,
 * and configuration values used across modules.
 */

module.exports = {
  // ─── User Roles ──────────────────────────────────────
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
  },

  // ─── User Statuses ───────────────────────────────────
  USER_STATUS: {
    ONLINE: 'online',
    OFFLINE: 'offline',
    AWAY: 'away',
    BUSY: 'busy',
  },

  // ─── Message Types ───────────────────────────────────
  MESSAGE_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    FILE: 'file',
    VOICE: 'voice',
    CALL: 'call',
    SYSTEM: 'system',
  },

  // ─── Chat Types ──────────────────────────────────────
  CHAT_TYPES: {
    DIRECT: 'direct',
    GROUP: 'group',
    SUPERGROUP: 'supergroup',
  },

  // ─── Call Types ──────────────────────────────────────
  CALL_TYPES: {
    AUDIO: 'audio',
    VIDEO: 'video',
  },

  // ─── Call Statuses ───────────────────────────────────
  CALL_STATUSES: {
    RINGING: 'ringing',
    ACTIVE: 'active',
    ENDED: 'ended',
    MISSED: 'missed',
    REJECTED: 'rejected',
  },

  // ─── Notification Types ──────────────────────────────
  NOTIFICATION_TYPES: {
    MESSAGE: 'message',
    CALL: 'call',
    CALL_MISSED: 'call_missed',
    GROUP_INVITE: 'group_invite',
    FRIEND_REQUEST: 'friend_request',
    STATUS_CHANGE: 'status_change',
  },

  // ─── File Limits ─────────────────────────────────────
  FILE_LIMITS: {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'audio/mpeg', 'application/pdf'],
  },

  // ─── Token Security ──────────────────────────────────
  AUTH_LIMITS: {
    ACCESS_TOKEN_EXP: '1h',
    REFRESH_TOKEN_EXP: '7d',
  },

  // ─── Pagination Defaults ─────────────────────────────
  DEFAULT_PAGE_SIZE: 30,
  MAX_PAGE_SIZE: 100,

  // ─── Duplicate Call Prevention ───────────────────────
  CALL_DUPLICATE_WINDOW_MS: 5000, // 5 seconds

  // ─── WebSocket Events ────────────────────────────────
  WS_EVENTS: {
    // Connection lifecycle
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',

    // Chat room events
    JOIN_CHAT: 'join-chat',
    LEAVE_CHAT: 'leave-chat',
    USER_JOINED: 'user-joined',
    USER_LEFT: 'user-left',
    CHAT_CLEARED: 'chat-cleared',

    // Messages
    NEW_MESSAGE: 'new-message',
    RECEIVE_MESSAGE: 'receive-message',
    MESSAGE_DELIVERED: 'message-delivered',
    MESSAGE_NOTIFICATION: 'message-notification',

    // Message updates
    MESSAGE_EDITED: 'message-edited',
    MESSAGE_UPDATED: 'message-updated',
    MESSAGE_DELETED: 'message-deleted',
    MESSAGE_REMOVED: 'message-removed',

    // Typing
    TYPING_START: 'typing-start',
    TYPING_STOP: 'typing-stop',
    USER_TYPING: 'user-typing',
    USER_STOPPED_TYPING: 'user-stopped-typing',

    // Reactions
    REACTION_ADDED: 'reaction-added',
    REACTION_UPDATE: 'reaction-update',

    // User status
    STATUS_CHANGED: 'status-changed',
    USER_STATUS_CHANGED: 'user-status-changed',

    // Supergroup topics
    TOPIC_SWITCHED: 'topic-switched',
    TOPIC_CHANGED: 'topic-changed',

    // ─── Call events (WebRTC signaling) ────────────────
    INITIATE_CALL: 'initiate-call',
    INCOMING_CALL: 'incoming-call',
    CALL_USER: 'call-user',
    ACCEPT_CALL: 'accept-call',
    CALL_ACCEPTED: 'call-accepted',
    REJECT_CALL: 'reject-call',
    CALL_REJECTED: 'call-rejected',
    END_CALL: 'end-call',
    CALL_ENDED: 'call-ended',
    CALL_SIGNALING: 'call-signaling',
    CALL_MISSED: 'call-missed',
    ANSWER_CALL: 'answer-call',

    // ─── Call participant events ───────────────────────
    PARTICIPANT_JOINED: 'participant-joined',
    PARTICIPANT_LEFT: 'participant-left',

    // ─── Notifications ────────────────────────────────
    NOTIFICATION: 'notification',
    NOTIFICATION_READ: 'notification-read',
    NOTIFICATION_DELETED: 'notification-deleted',
  },
};
