import React from 'react';

export const metadata = {
  title: 'Login - VioApp',
  description: 'Authentication for VioApp',
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-white/20">
        {children}
      </div>
    </div>
  );
}
