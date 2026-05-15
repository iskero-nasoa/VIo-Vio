import { useSocket } from './useSocket';
import {
  emitJoinChat,
  emitLeaveChat,
  emitTyping,
  emitStopTyping,
  emitReaction,
  emitStatusChange,
  emitInitiateCall,
  emitAcceptCall,
  emitRejectCall,
  emitEndCall
} from '../utils/socketEmitters';

export const useSocketEmit = () => {
  const { socket } = useSocket();

  return {
    emitJoinChat: (chatId) => emitJoinChat(socket, chatId),
    emitLeaveChat: (chatId) => emitLeaveChat(socket, chatId),
    emitTypingStart: (chatId) => emitTyping(socket, chatId),
    emitTypingStop: (chatId) => emitStopTyping(socket, chatId),
    emitReaction: (messageId, emoji, chatId) => emitReaction(socket, messageId, emoji, chatId),
    emitStatusChange: (status) => emitStatusChange(socket, status),
    emitInitiateCall: (recipientId, callType) => emitInitiateCall(socket, recipientId, callType),
    emitAcceptCall: (callId) => emitAcceptCall(socket, callId),
    emitRejectCall: (callId) => emitRejectCall(socket, callId),
    emitEndCall: (callId) => emitEndCall(socket, callId)
  };
};
