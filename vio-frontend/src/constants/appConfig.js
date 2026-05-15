export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
export const APP_NAME = "VioApp";
export const VERSION = "1.0.0";
export const ENVIRONMENT = process.env.NODE_ENV || 'development';

export const CHAT_TYPES = {
  DIRECT: 'direct',
  GROUP: 'group',
};

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  AUDIO: 'audio',
  SYSTEM: 'system',
};

export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy',
};

export const CALL_STATUS = {
  IDLE: 'idle',
  RINGING: 'ringing',
  ACTIVE: 'active',
  ENDED: 'ended',
  MISSED: 'missed',
};
