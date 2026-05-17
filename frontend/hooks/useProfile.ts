import { useState, useCallback } from "react";
import { api } from "../utils/api";
import { User } from "../types/chat";

export const useProfile = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUserProfile(userId);
      setProfile(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await api.updateProfile(data);
      setProfile(updated);
      return updated;
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File, onProgress?: (p: any) => void) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.uploadAvatar(file, onProgress);
      if (profile) {
        setProfile({ ...profile, avatar: res.avatar });
      }
      return res;
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [profile]);

  return { profile, loading, error, getProfile, updateProfile, uploadAvatar };
};
