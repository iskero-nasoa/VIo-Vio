"use client";

import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { THEMES } from '../../constants/themeConstants';

export default function ThemeSettings() {
  const { theme, setTheme, primaryColor, setPrimaryColor, accentColor, setAccentColor } = useTheme();

  const presets = [
    '#007AFF', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#F43F5E', // Rose
    '#F97316', // Orange
    '#10B981', // Emerald
    '#06B6D4', // Cyan
  ];

  return (
    <div className="space-y-8 animate-pop-in">
      {/* Theme Mode */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Appearance</h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: THEMES.LIGHT, label: 'Light', icon: Sun },
            { id: THEMES.DARK, label: 'Dark', icon: Moon },
            { id: THEMES.AUTO, label: 'Auto', icon: Monitor },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setTheme(mode.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                theme === mode.id
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500'
              }`}
            >
              <mode.icon size={20} />
              <span className="text-xs font-bold">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Color Picker */}
      <div className="space-y-3">
        <div className="flex justify-between items-center ml-1">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brand Color</h4>
          <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">{primaryColor}</span>
        </div>
        <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner shadow-black/[0.02]">
          {presets.map((color) => (
            <button
              key={color}
              onClick={() => setPrimaryColor(color)}
              className="w-10 h-10 rounded-xl transition-all hover:scale-110 active:scale-90 flex items-center justify-center shadow-lg"
              style={{ backgroundColor: color }}
            >
              {primaryColor === color && <Check size={20} className="text-white drop-shadow-md" />}
            </button>
          ))}
          <div className="relative w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center group">
             <input 
              type="color" 
              value={primaryColor} 
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
            />
            <div className="w-6 h-6 rounded-md border-2 border-slate-400 border-dashed group-hover:scale-110 transition-transform"></div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Preview</h4>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary shadow-lg shadow-primary/20"></div>
            <div className="flex-1 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800"></div>
          </div>
          <div className="flex gap-2">
            <div className="w-1/3 h-3 rounded-full bg-primary/20"></div>
            <div className="w-1/2 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          </div>
          <button className="w-full py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">
            Primary Button
          </button>
        </div>
      </div>
    </div>
  );
}
