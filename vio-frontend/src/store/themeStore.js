import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_THEME, DEFAULT_PRIMARY_COLOR, DEFAULT_ACCENT_COLOR } from '../constants/themeConstants';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: DEFAULT_THEME,
      primaryColor: DEFAULT_PRIMARY_COLOR,
      accentColor: DEFAULT_ACCENT_COLOR,

      setTheme: (theme) => set({ theme }),
      
      setPrimaryColor: (primaryColor) => set({ primaryColor }),
      
      setAccentColor: (accentColor) => set({ accentColor }),
      
      toggleTheme: () => {
        const { theme } = get();
        set({ theme: theme === 'dark' ? 'light' : 'dark' });
      },
    }),
    {
      name: 'vio-theme-storage',
    }
  )
);
