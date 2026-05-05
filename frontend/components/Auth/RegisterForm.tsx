"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { RegisterPayload, ValidationErrors } from "@/types/auth";
import { validateRegisterForm } from "@/utils/validation";

export default function RegisterForm() {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<RegisterPayload>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateRegisterForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    try {
      await register(formData);
    } catch {
      // error handled in hook
    }
  };

  // Password strength indicator
  const getPasswordStrength = (
    password: string
  ): { label: string; color: string; width: string } => {
    if (!password) return { label: "", color: "", width: "0%" };
    if (password.length < 6)
      return { label: "Слабый", color: "bg-red-500", width: "25%" };
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(
      Boolean
    ).length;
    if (score <= 1)
      return { label: "Слабый", color: "bg-orange-500", width: "33%" };
    if (score <= 2)
      return { label: "Средний", color: "bg-yellow-500", width: "66%" };
    return { label: "Сильный", color: "bg-emerald-500", width: "100%" };
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Server error */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-3 animate-shake">
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Username */}
      <div className="space-y-2">
        <label
          htmlFor="register-username"
          className="block text-sm font-medium text-slate-300"
        >
          Имя пользователя
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <input
            id="register-username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="your_username"
            autoComplete="username"
            className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 ${
              validationErrors.username
                ? "border-red-500/50 focus:ring-red-500/40"
                : "border-white/10 hover:border-white/20"
            }`}
          />
        </div>
        {validationErrors.username && (
          <p className="text-xs text-red-400 mt-1 ml-1 animate-fadeIn">
            {validationErrors.username}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="register-email"
          className="block text-sm font-medium text-slate-300"
        >
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <input
            id="register-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 ${
              validationErrors.email
                ? "border-red-500/50 focus:ring-red-500/40"
                : "border-white/10 hover:border-white/20"
            }`}
          />
        </div>
        {validationErrors.email && (
          <p className="text-xs text-red-400 mt-1 ml-1 animate-fadeIn">
            {validationErrors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label
          htmlFor="register-password"
          className="block text-sm font-medium text-slate-300"
        >
          Пароль
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="new-password"
            className={`w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 ${
              validationErrors.password
                ? "border-red-500/50 focus:ring-red-500/40"
                : "border-white/10 hover:border-white/20"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword ? (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
        {/* Password strength bar */}
        {formData.password && (
          <div className="space-y-1.5 animate-fadeIn">
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full ${strength.color} rounded-full transition-all duration-500`}
                style={{ width: strength.width }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Надёжность: <span className="text-slate-400">{strength.label}</span>
            </p>
          </div>
        )}
        {validationErrors.password && (
          <p className="text-xs text-red-400 mt-1 ml-1 animate-fadeIn">
            {validationErrors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label
          htmlFor="register-confirm-password"
          className="block text-sm font-medium text-slate-300"
        >
          Подтвердите пароль
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <input
            id="register-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="new-password"
            className={`w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 ${
              validationErrors.confirmPassword
                ? "border-red-500/50 focus:ring-red-500/40"
                : "border-white/10 hover:border-white/20"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showConfirmPassword ? (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
        {validationErrors.confirmPassword && (
          <p className="text-xs text-red-400 mt-1 ml-1 animate-fadeIn">
            {validationErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        id="register-submit"
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:from-violet-700 active:to-indigo-700 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-violet-500/25 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Регистрация...
          </>
        ) : (
          "Создать аккаунт"
        )}
      </button>

      {/* Login link */}
      <p className="text-center text-sm text-slate-400">
        Уже есть аккаунт?{" "}
        <Link
          href="/auth/login"
          className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
        >
          Войти
        </Link>
      </p>
    </form>
  );
}
