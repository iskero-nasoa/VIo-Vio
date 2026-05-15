"use client";

import { Play, Pause, Download, Volume2 } from 'lucide-react';
import { useRef, useState } from 'react';

export default function AudioPlayer({ audioUrl, filename }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(p);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 max-w-sm w-full">
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="flex items-center gap-3">
        <button 
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-0.5" fill="currentColor" />}
        </button>

        <div className="flex-1 flex flex-col gap-1.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{filename || 'Audio Message'}</span>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-100" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        <a 
          href={audioUrl} 
          download={filename}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <Download size={18} />
        </a>
      </div>
    </div>
  );
}
