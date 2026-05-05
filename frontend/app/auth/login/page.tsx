import LoginForm from "@/components/Auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl shadow-2xl p-8 space-y-6">
      {/* Logo & Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 mb-2">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Добро пожаловать
        </h1>
        <p className="text-slate-400 text-sm">
          Войдите, чтобы продолжить в Isko-Gram
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
