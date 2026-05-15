"use client";

import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { applyTheme } from '../utils/themeUtils';

export default function ThemeProvider({ children }) {
  const { theme, primaryColor, accentColor } = useThemeStore();

  useEffect(() => {
    applyTheme(theme, { primary: primaryColor, accent: accentColor });
  }, [theme, primaryColor, accentColor]);

  // Handle system theme changes if 'auto'
  useEffect(() => {
    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('auto', { primary: primaryColor, accent: accentColor });
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, primaryColor, accentColor]);

  return <>{children}</>;
}
