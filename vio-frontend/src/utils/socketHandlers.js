export const handleReceiveMessage = (data, messageStore, chatStore) => {
  const { message, chatId } = data;
  messageStore.addMessage(chatId, message);
  chatStore.updateChatLastMessage(chatId, message);
};

export const handleUserJoined = (data, userStore, notificationStore) => {
  // data: { chatId, user }
  if (data.user) {
    notificationStore.addToast({
      type: 'info',
      message: `${data.user.username} joined the chat`,
      title: 'New Member'
    });
  }
};

export const handleUserStatusChange = (data, userStore) => {
  // data: { userId, status }
  // Update user store or globally known users cache if one exists
  console.log('User status changed', data);
};

export const handleIncomingCall = (data, notificationStore, callStore) => {
  // data: { callId, initiator, callType, chatId }
  if (callStore) {
    callStore.setIncomingCall(data);
  }
  
  notificationStore.addToast({
    type: 'call',
    title: `Incoming ${data.callType} call`,
    message: `${data.initiator.username} is calling you`,
    data: data,
    duration: 30000 // Rings for 30s
  });
};

export const handleCallAccepted = (data, router, callStore) => {
  // data: { callId, call }
  if (callStore && data.call) {
    callStore.setActiveCall(data.call);
    callStore.clearIncomingCall();
  }
  if (data.callId) {
    router.push(`/calls/${data.callId}`);
  }
};

export const handleCallEnded = (callStore) => {
  if (callStore) {
    callStore.clearActiveCall();
    callStore.clearIncomingCall();
  }
};

export const handleMessageReaction = (data, messageStore) => {
  // data: { messageId, chatId, reactions }
  messageStore.updateReaction(data.chatId, data.messageId, data.reactions);
};

export const handleNotification = (data, notificationStore) => {
  notificationStore.addNotification(data);
  notificationStore.addToast({
    type: 'info',
    title: data.title,
    message: data.body
  });
};
