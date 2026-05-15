"use client";

export default function Input({ 
  label, 
  type = "text", 
  placeholder, 
  error, 
  register, 
  required = false, 
  className = "",
  ...props 
}) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 transition-all outline-none font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-medium ${
            error 
              ? 'border-red-500/50 focus:border-red-500 bg-red-50/30 dark:bg-red-500/5' 
              : 'border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-slate-800'
          }`}
          {...(register ? register : {})}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[10px] font-black text-red-500 uppercase tracking-wider ml-1 animate-shake">
          {error}
        </p>
      )}
    </div>
  );
}
