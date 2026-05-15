"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../common/LoadingSpinner';

export default function AuthGuard({ children }) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to prevent layout flicker while Zustand hydrates
    const timer = setTimeout(() => {
      if (!token || !user) {
        router.replace('/login');
      } else {
        setIsChecking(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [token, user, router]);

  if (isChecking) {
    return <LoadingSpinner overlay={true} />;
  }

  return children;
}
