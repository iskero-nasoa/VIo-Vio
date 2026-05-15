import { useState } from 'react';
import { useMessageStore } from '../store/messageStore';

export function useMessageInput(chatId) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { sendMessage: storeSendMessage } = useMessageStore();

  const clearInput = () => {
    setContent('');
    setAttachments([]);
    setError(null);
  };

  const addAttachment = (attachment) => {
    setAttachments(prev => [...prev, attachment]);
  };

  const removeAttachment = (indexToRemove) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const sendMessage = async () => {
    if ((!content.trim() && attachments.length === 0) || !chatId) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real app with file uploads, attachments would be uploaded first and URLs returned.
      // Here we assume attachments are already uploaded objects { url, type, filename, size }.
      // Or we pass them to sendMessage if it handles the multipart form data.
      // For this curriculum, we assume they are ready.
      
      const payloadContent = content; // Can be parsed for mentions/links before sending if needed
      
      await storeSendMessage(chatId, payloadContent, attachments);
      clearInput();
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    content,
    setContent,
    attachments,
    setAttachments,
    isLoading,
    error,
    sendMessage,
    clearInput,
    addAttachment,
    removeAttachment
  };
}
