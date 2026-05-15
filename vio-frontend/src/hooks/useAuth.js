// src/hooks/useAuth.js
/**
 * Custom hook for authentication logic.
 * Wraps Zustand store and provides easy access to auth state.
 */
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, token, setAuth, logout, isLoading } = useAuthStore();
  
  return {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    setAuth,
    logout
  };
};
