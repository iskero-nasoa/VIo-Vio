import { useState } from 'react';
import api from '../utils/api';

export function useChatSearch(chatId) {
  const [results, setResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchMessages = async (query) => {
    if (!query) {
      setResults([]);
      setCurrentIndex(-1);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get(`/messages/${chatId}/search?q=${query}`);
      setResults(response.data || []);
      setCurrentIndex(response.data.length > 0 ? 0 : -1);
    } catch (err) {
      setError('Search in chat failed');
    } finally {
      setIsLoading(false);
    }
  };

  const nextResult = () => {
    if (results.length > 0) {
      setCurrentIndex(prev => (prev + 1) % results.length);
    }
  };

  const prevResult = () => {
    if (results.length > 0) {
      setCurrentIndex(prev => (prev - 1 + results.length) % results.length);
    }
  };

  return {
    results,
    currentIndex,
    isLoading,
    error,
    searchMessages,
    nextResult,
    prevResult
  };
}
