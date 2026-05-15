"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import Input from '../common/Input';
import Button from '../common/Button';
import Link from 'next/link';

export default function LoginForm() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setToken, setUser } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', data);
      setToken(response.data.token);
      setUser(response.data.user);
      router.push('/');
    } catch (err) {
      setError(err.readableMessage || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-10 bg-white dark:bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-pop-in">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center text-white text-4xl font-black mx-auto mb-6 shadow-xl shadow-primary/30">
          V
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">Welcome Back</h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-2">Log in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-500 text-xs font-bold flex items-center gap-3 animate-shake">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            {error}
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          error={errors.email?.message}
          register={register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z0-9.-]+$/i,
              message: "Invalid email address"
            }
          })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          register={register('password', { 
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' }
          })}
        />

        <div className="flex justify-end">
          <Link href="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
            Forgot Password?
          </Link>
        </div>

        <Button 
          type="submit" 
          loading={isLoading} 
          className="w-full py-4 text-base"
        >
          Login
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs font-bold text-slate-500">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary font-black uppercase tracking-widest hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
