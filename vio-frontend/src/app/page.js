'use client';

import { useEffect, useState } from 'react';

export default function RootPage() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/login';
    } else {
      window.location.href = '/chat';
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">VioApp</h2>
          <p className="text-slate-500">Securing your connection...</p>
        </div>
      </div>
    </div>
  );
}
