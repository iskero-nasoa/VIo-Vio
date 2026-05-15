"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import Input from '../common/Input';
import Button from '../common/Button';
import Link from 'next/link';

export default function RegisterForm() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setToken, setUser } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password
      });
      setToken(response.data.token);
      setUser(response.data.user);
      router.push('/');
    } catch (err) {
      setError(err.readableMessage || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-10 bg-white dark:bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-pop-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">Join VioApp</h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-2">Create your free account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-500 text-xs font-bold flex items-center gap-3 animate-shake">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            {error}
          </div>
        )}

        <Input
          label="Username"
          placeholder="johndoe"
          error={errors.username?.message}
          register={register('username', { 
            required: 'Username is required',
            minLength: { value: 3, message: 'Minimum 3 characters' },
            pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Alphanumeric and underscores only' }
          })}
        />

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
            minLength: { value: 6, message: 'Minimum 6 characters' }
          })}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          register={register('confirmPassword', { 
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match'
          })}
        />

        <Button 
          type="submit" 
          loading={isLoading} 
          className="w-full py-4 text-base mt-4"
        >
          Create Account
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs font-bold text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-black uppercase tracking-widest hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
