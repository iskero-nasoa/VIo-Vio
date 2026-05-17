import RegisterForm from "@/components/Auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl shadow-2xl p-8 space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 mb-2">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Создать аккаунт</h1>
        <p className="text-slate-400 text-sm">Присоединяйтесь к Isko-Gram</p>
      </div>
      <RegisterForm />
    </div>
  );
}
