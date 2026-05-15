"use client";

import { Play, Pause, Volume2, Maximize } from 'lucide-react';
import { useRef, useState } from 'react';

export default function VideoPlayer({ videoUrl, thumbnailUrl }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative group rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-200 dark:border-slate-800">
      <video 
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        className="max-w-full max-h-full"
        onClick={togglePlay}
      />

      {/* Custom Overlay (simplified) */}
      {!isPlaying && (
        <button 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors"
        >
          <div className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30 shadow-xl transform group-hover:scale-110 transition-transform">
            <Play size={32} fill="currentColor" />
          </div>
        </button>
      )}

      {/* Bottom Control Bar (Minimalist) */}
      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between text-white">
        <button onClick={togglePlay}>
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </button>
        <div className="flex-1 mx-4 h-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-1/3" /> {/* Placeholder progress */}
        </div>
        <div className="flex gap-3">
          <Volume2 size={18} />
          <Maximize size={18} />
        </div>
      </div>
    </div>
  );
}
