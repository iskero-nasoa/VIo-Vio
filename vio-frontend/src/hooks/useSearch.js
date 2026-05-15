import { useState, useCallback } from 'react';
import api from '../utils/api';
import { MAX_SEARCH_RESULTS } from '../constants/searchConstants';

export function useSearch() {
  const [results, setResults] = useState({ users: [], chats: [], messages: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const globalSearch = useCallback(async (query) => {
    if (!query || query.length < 2) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const [usersRes, chatsRes, messagesRes] = await Promise.all([
        api.get(`/users/search?q=${query}&limit=${MAX_SEARCH_RESULTS.users}`),
        api.get(`/chats?search=${query}&limit=${MAX_SEARCH_RESULTS.chats}`),
        api.get(`/messages/search/global?q=${query}&limit=${MAX_SEARCH_RESULTS.messages}`)
      ]);

      setResults({
        users: usersRes.data || [],
        chats: chatsRes.data || [],
        messages: messagesRes.data || []
      });
    } catch (err) {
      setError('Global search failed');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchUsers = async (query) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/users/search?q=${query}`);
      return response.data;
    } catch (err) {
      setError('User search failed');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults({ users: [], chats: [], messages: [] });
  };

  return {
    results,
    isLoading,
    error,
    globalSearch,
    searchUsers,
    clearResults
  };
}
