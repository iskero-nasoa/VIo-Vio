"use client";

import { useMobileDetect } from '../../hooks/useMobileDetect';
import BottomNavigation from './BottomNavigation';

export default function ResponsiveLayout({ children, sidebar }) {
  const { isMobile } = useMobileDetect();

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-900/20">
      {/* Sidebar - hidden on mobile */}
      {!isMobile && (
        <aside className="w-[300px] md:w-[350px] flex-shrink-0 border-r border-slate-200 dark:border-slate-800 h-full overflow-hidden">
          {sidebar}
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 h-full overflow-hidden relative ${isMobile ? 'pb-[64px]' : ''}`}>
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      {isMobile && <BottomNavigation />}
    </div>
  );
}
