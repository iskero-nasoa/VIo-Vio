"use client";

import { Loader2 } from 'lucide-react';

export default function Button({ 
  children, 
  onClick, 
  type = "button", 
  loading = false, 
  disabled = false, 
  variant = "primary", 
  className = "",
  ...props 
}) {
  const variants = {
    primary: "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700",
    danger: "bg-red-500 text-white shadow-lg shadow-red-500/25 hover:bg-red-600",
    outline: "border-2 border-primary text-primary hover:bg-primary/5"
  };

  const baseStyles = "relative flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      <span className={loading ? "opacity-0" : "opacity-100"}>{children}</span>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={18} className="animate-spin" />
        </div>
      )}
    </button>
  );
}
