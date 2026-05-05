import React from "react";
import { UserAvatar } from "../Common/UserAvatar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Mail, Phone, Calendar, MessageSquare, Edit3, ShieldCheck } from "lucide-react";
import { User } from "../../types/chat";

interface ProfileCardProps {
  user: User;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onSendMessage?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ 
  user, 
  isOwnProfile, 
  onEdit, 
  onSendMessage 
}) => {
  return (
    <div className="bg-card border border-border rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Floating Edit Button */}
      {isOwnProfile && (
        <button 
          onClick={onEdit}
          className="absolute top-8 right-8 z-30 p-3 bg-secondary/80 backdrop-blur-md text-foreground hover:text-primary hover:bg-primary/10 rounded-2xl transition-all shadow-xl border border-border/50 active:scale-95 group-hover:border-primary/30"
          title="Редактировать профиль"
        >
          <Edit3 size={20} />
        </button>
      )}
      
      <div className="flex flex-col items-center text-center space-y-8 relative z-10">
        <div className="relative">
          <UserAvatar user={user} size="xl" />
          <div className="absolute -bottom-3 right-1 bg-primary text-white p-2 rounded-2xl shadow-2xl border-4 border-card">
            <ShieldCheck size={20} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tighter">{user.username}</h2>
          <div className="flex items-center justify-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              user.status === 'online' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 
              user.status === 'away' ? 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-slate-500'
            }`}></div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              {user.statusText || user.status || "Offline"}
            </p>
          </div>
        </div>

        {user.description && (
          <p className="text-muted-foreground text-base max-w-md leading-relaxed italic opacity-80">
            "{user.description}"
          </p>
        )}

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 py-10 border-y border-border/40">
          <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-2xl border border-transparent hover:border-border transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Mail size={22} />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Email</p>
              <p className="text-sm font-bold truncate">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-2xl border border-transparent hover:border-border transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Phone size={22} />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Телефон</p>
              <p className="text-sm font-bold">{user.phone || "Не указан"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-2xl border border-transparent hover:border-border transition-all sm:col-span-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Calendar size={22} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Регистрация</p>
              <p className="text-sm font-bold">
                {format(new Date(user.createdAt), "dd MMMM yyyy", { locale: ru })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 w-full pt-4">
          {isOwnProfile ? (
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-[1.5rem] transition-all font-black text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] hover:shadow-primary/40"
            >
              <Edit3 size={24} />
              РЕДАКТИРОВАТЬ ПРОФИЛЬ
            </button>
          ) : (
            <button
              onClick={onSendMessage}
              className="flex-1 flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-[1.5rem] transition-all font-black text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] hover:shadow-primary/40"
            >
              <MessageSquare size={24} />
              НАПИСАТЬ СООБЩЕНИЕ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
