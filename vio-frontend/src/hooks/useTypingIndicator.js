import { useState, useEffect, useCallback, useRef } from 'react';

export function useTypingIndicator(chatId, socket) {
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = ({ chatId: typedChatId, username }) => {
      if (typedChatId !== chatId) return;
      
      setTypingUsers(prev => {
        if (!prev.includes(username)) {
          return [...prev, username];
        }
        return prev;
      });
    };

    const handleUserStoppedTyping = ({ chatId: typedChatId, username }) => {
      if (typedChatId !== chatId) return;
      
      setTypingUsers(prev => prev.filter(u => u !== username));
    };

    socket.on('user-typing', handleUserTyping);
    socket.on('user-stopped-typing', handleUserStoppedTyping);

    return () => {
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stopped-typing', handleUserStoppedTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId, socket]);

  const startTyping = useCallback(() => {
    if (!socket || !chatId) return;
    
    socket.emit('typing-start', { chatId });

    // Auto stop after 2 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  }, [chatId, socket]);

  const stopTyping = useCallback(() => {
    if (!socket || !chatId) return;
    socket.emit('typing-stop', { chatId });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [chatId, socket]);

  return { startTyping, stopTyping, typingUsers };
}
