"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { RegisterPayload, ValidationErrors } from "@/types/auth";
import { validateRegisterForm } from "@/utils/validation";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";

export default function RegisterForm() {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<RegisterPayload>({ username: "", email: "", password: "", confirmPassword: "" });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validateRegisterForm(formData);
    if (Object.keys(errors).length > 0) { setValidationErrors(errors); return; }
    setValidationErrors({});
    try { await register(formData); } catch {}
  };

  const inputClass = (hasError?: string) =>
    `w-full pl-11 pr-4 py-3 rounded-xl bg-secondary border text-foreground placeholder-muted-foreground outline-none transition-all text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary ${
      hasError ? "border-red-500/60" : "border-border hover:border-muted-foreground/40"
    }`;

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-4">
          <span className="text-2xl font-black text-white">V</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Create account</h1>
        <p className="text-sm text-muted-foreground mt-1">Join VioApp today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Username
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="your_username"
              autoComplete="username"
              className={inputClass(validationErrors.username)}
            />
          </div>
          {validationErrors.username && (
            <p className="text-xs text-red-400 mt-1">{validationErrors.username}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              className={inputClass(validationErrors.email)}
            />
          </div>
          {validationErrors.email && (
            <p className="text-xs text-red-400 mt-1">{validationErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              className={`${inputClass(validationErrors.password)} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {validationErrors.password && (
            <p className="text-xs text-red-400 mt-1">{validationErrors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              className={`${inputClass(validationErrors.confirmPassword)} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <p className="text-xs text-red-400 mt-1">{validationErrors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl font-bold text-primary-foreground bg-primary hover:bg-cyan-500 active:bg-cyan-700 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : "Create Account"}
        </button>

        <p className="text-center text-sm text-muted-foreground pt-2">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:text-cyan-400 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
