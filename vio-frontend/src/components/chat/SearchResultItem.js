"use client";

import { User, MessageSquare, Hash, Calendar } from 'lucide-react';
import { highlightSearchText } from '../../utils/searchFormatters';
import { formatNotificationTime } from '../../utils/notificationFormatters';

export default function SearchResultItem({ result, type, query, onClick }) {
  const handleClick = () => onClick(result);

  if (type === 'user') {
    return (
      <div 
        onClick={handleClick}
        className="p-3 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
      >
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
          {result.avatar ? <img src={result.avatar} className="w-full h-full object-cover" /> : <User size={24} className="text-slate-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
            {highlightSearchText(result.username, query)}
          </h4>
          <p className="text-[10px] text-slate-500 truncate font-bold uppercase tracking-widest">{result.email}</p>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${result.status === 'online' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
      </div>
    );
  }

  if (type === 'chat') {
    return (
      <div 
        onClick={handleClick}
        className="p-3 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden text-primary">
          {result.avatar ? <img src={result.avatar} className="w-full h-full object-cover" /> : (result.isSupergroup ? <Hash size={24} /> : <User size={24} />)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
            {highlightSearchText(result.name || result.chatName, query)}
          </h4>
          <p className="text-xs text-slate-500 truncate">{result.lastMessage?.content || 'No messages'}</p>
        </div>
        {result.unreadCount > 0 && (
          <span className="px-1.5 py-0.5 bg-primary text-white text-[10px] font-black rounded-full">{result.unreadCount}</span>
        )}
      </div>
    );
  }

  if (type === 'message') {
    return (
      <div 
        onClick={handleClick}
        className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all group"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
              {result.sender?.avatar ? <img src={result.sender.avatar} className="w-full h-full object-cover" /> : <User size={14} className="text-slate-400" />}
            </div>
            <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{result.sender?.username}</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">{formatNotificationTime(result.createdAt)}</span>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic mb-2">
          "{highlightSearchText(result.content, query)}"
        </p>

        <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-lg w-fit">
          <MessageSquare size={10} />
          <span>{result.chat?.name || result.chat?.chatName || 'Chat'}</span>
        </div>
      </div>
    );
  }

  return null;
}
