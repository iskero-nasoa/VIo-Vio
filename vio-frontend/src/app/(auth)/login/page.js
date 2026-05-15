'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      window.location.href = '/';
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { user, token } = response.data.data || response.data;

      if (!token) {
        setError('Authentication failed: No token received');
        return;
      }

      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      window.location.href = '/';
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold text-white mb-2">Welcome Back</h2>
        <p className="text-white/70">Sign in to continue to VioApp</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-4 rounded-xl mb-6 text-sm animate-pulse">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5 ml-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3.5 bg-white/10 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            placeholder="name@company.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5 ml-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3.5 bg-white/10 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : 'Login'}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-white/10 text-center">
        <p className="text-white/60">
          New to VioApp?{' '}
          <a href="/register" className="text-white font-bold hover:underline">Create an account</a>
        </p>
      </div>
    </div>
  );
}