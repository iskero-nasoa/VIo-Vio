"use client";

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 m-4">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-8">
            The component crashed due to an unexpected error. We've logged the details.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <RefreshCw size={18} />
            Refresh App
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-red-50 dark:bg-red-500/5 rounded-xl text-left overflow-auto max-w-full">
               <p className="text-[10px] font-mono text-red-500 font-bold uppercase mb-2 tracking-widest">Developer Info:</p>
               <pre className="text-[10px] font-mono text-red-600 dark:text-red-400">
                 {this.state.error?.toString()}
               </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
