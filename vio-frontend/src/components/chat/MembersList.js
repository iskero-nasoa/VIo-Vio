"use client";

import { User, Shield, X, MoreVertical } from 'lucide-react';

export default function MembersList({ chatId, members = [], isAdmin, onRemoveMember }) {
  return (
    <div className="space-y-2">
      {members.map(member => (
        <div key={member._id} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-3 group transition-all hover:shadow-md">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
              {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : <User size={24} />}
            </div>
            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${member.status === 'online' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{member.username}</h4>
              {member.role === 'admin' && (
                <Shield size={12} className="text-amber-500" fill="currentColor" />
              )}
            </div>
            <p className="text-[10px] text-slate-500 truncate font-medium uppercase tracking-wider">{member.statusMessage || (member.role === 'admin' ? 'Administrator' : 'Member')}</p>
          </div>

          {isAdmin && member.role !== 'admin' && (
            <button 
              onClick={() => onRemoveMember(member._id)}
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
            >
              <X size={18} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
