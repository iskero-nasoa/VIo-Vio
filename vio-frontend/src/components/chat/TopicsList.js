"use client";

import { Hash, Edit2, Trash2, ChevronRight } from 'lucide-react';

export default function TopicsList({ topics = [], currentTopicId, onTopicSwitch, isAdmin, onEdit, onDelete }) {
  return (
    <div className="space-y-2">
      {topics.map(topic => (
        <div 
          key={topic._id}
          onClick={() => onTopicSwitch(topic._id)}
          className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border group ${
            currentTopicId === topic._id 
              ? 'bg-primary/10 border-primary shadow-inner shadow-primary/5' 
              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            currentTopicId === topic._id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
            <Hash size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className={`text-sm leading-none mb-1 ${currentTopicId === topic._id ? 'font-black text-primary' : 'font-bold text-slate-800 dark:text-slate-100'}`}>
              {topic.name}
            </h4>
            <p className="text-xs text-slate-500 truncate">{topic.description || 'No description'}</p>
          </div>

          {isAdmin ? (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(topic); }}
                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(topic._id); }}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <ChevronRight size={18} className={`text-slate-300 transition-transform ${currentTopicId === topic._id ? 'translate-x-1' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}
