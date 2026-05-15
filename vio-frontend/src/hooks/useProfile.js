import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

export function useProfile(userId = null) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: currentUser, setUser } = useAuthStore();

  const isOwnProfile = !userId || (currentUser && (currentUser.userId === userId || currentUser.id === userId));

  useEffect(() => {
    const fetchProfile = async () => {
      // If viewing own profile, we can use the store data immediately 
      // but might want to fetch fresh data
      if (isOwnProfile && currentUser) {
        setProfile(currentUser);
        return;
      }

      if (!userId) return;

      setIsLoading(true);
      try {
        const response = await api.get(`/users/${userId}`);
        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUser, isOwnProfile]);

  const updateProfile = async (data) => {
    if (!isOwnProfile) return false;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.put('/users/profile', data);
      setUser(response.data.user);
      setProfile(response.data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file) => {
    if (!isOwnProfile) return false;

    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUser(response.data.user);
      setProfile(response.data.user);
      return response.data.user.avatar;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload avatar');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (status) => {
    if (!isOwnProfile) return false;

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.put('/users/status', { status });
      setUser(response.data.user);
      setProfile(response.data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
    updateStatus
  };
}
