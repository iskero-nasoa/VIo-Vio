export const emitJoinChat = (socket, chatId) => {
  if (socket && chatId) socket.emit('join-chat', { chatId });
};

export const emitLeaveChat = (socket, chatId) => {
  if (socket && chatId) socket.emit('leave-chat', { chatId });
};

export const emitTyping = (socket, chatId) => {
  if (socket && chatId) socket.emit('typing-start', { chatId });
};

export const emitStopTyping = (socket, chatId) => {
  if (socket && chatId) socket.emit('typing-stop', { chatId });
};

export const emitInitiateCall = (socket, recipientId, callType = 'audio') => {
  if (socket && recipientId) socket.emit('initiate-call', { recipientId, callType });
};

export const emitAcceptCall = (socket, callId) => {
  if (socket && callId) socket.emit('accept-call', { callId });
};

export const emitRejectCall = (socket, callId) => {
  if (socket && callId) socket.emit('reject-call', { callId });
};

export const emitEndCall = (socket, callId) => {
  if (socket && callId) socket.emit('end-call', { callId });
};

export const emitStatusChange = (socket, status) => {
  if (socket && status) socket.emit('status-change', { status });
};

export const emitReaction = (socket, messageId, emoji, chatId) => {
  if (socket && messageId && emoji) socket.emit('message-reaction', { messageId, emoji, chatId });
};
