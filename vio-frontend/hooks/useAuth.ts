"use client";

import { useAuthContext } from "@/context/AuthContext";

/**
 * useAuth hook - now acts as a wrapper for AuthContext
 * This preserves compatibility with existing components.
 */
export function useAuth() {
  return useAuthContext();
}
