import { useState } from 'react';
import api from '../utils/api';
import { useChatStore } from '../store/chatStore';

export function useGroupManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatStore = useChatStore();

  const createGroup = async (groupData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/chats/group', groupData);
      chatStore.setChats([response.data, ...chatStore.chats]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createSupergroup = async (supergroupData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/chats/supergroup', supergroupData);
      chatStore.setChats([response.data, ...chatStore.chats]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create supergroup');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGroup = async (chatId, updates) => {
    try {
      const response = await api.put(`/chats/${chatId}`, updates);
      chatStore.updateChat(chatId, response.data);
      return response.data;
    } catch (err) {
      setError('Failed to update group');
      return null;
    }
  };

  const addMembers = async (chatId, memberIds) => {
    try {
      const response = await api.post(`/chats/${chatId}/members`, { memberIds });
      // Assuming response returns the updated chat or new members
      return response.data;
    } catch (err) {
      setError('Failed to add members');
      return null;
    }
  };

  const removeMember = async (chatId, memberId) => {
    try {
      await api.delete(`/chats/${chatId}/members/${memberId}`);
      chatStore.removeMember(chatId, memberId);
      return true;
    } catch (err) {
      setError('Failed to remove member');
      return false;
    }
  };

  const addTopic = async (chatId, topicData) => {
    try {
      const response = await api.post(`/chats/${chatId}/topics`, topicData);
      chatStore.addTopic(chatId, response.data);
      return response.data;
    } catch (err) {
      setError('Failed to add topic');
      return null;
    }
  };

  const updateTopic = async (chatId, topicId, updates) => {
    try {
      const response = await api.put(`/chats/${chatId}/topics/${topicId}`, updates);
      chatStore.updateTopic(chatId, topicId, response.data);
      return response.data;
    } catch (err) {
      setError('Failed to update topic');
      return null;
    }
  };

  const deleteTopic = async (chatId, topicId) => {
    try {
      await api.delete(`/chats/${chatId}/topics/${topicId}`);
      chatStore.deleteTopic(chatId, topicId);
      return true;
    } catch (err) {
      setError('Failed to delete topic');
      return false;
    }
  };

  const switchTopic = async (chatId, topicId) => {
    chatStore.setCurrentTopic(chatId, topicId);
  };

  return {
    createGroup,
    createSupergroup,
    updateGroup,
    addMembers,
    removeMember,
    addTopic,
    updateTopic,
    deleteTopic,
    switchTopic,
    isLoading,
    error
  };
}
