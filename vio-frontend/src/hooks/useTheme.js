import { useThemeStore } from '../store/themeStore';

export function useTheme() {
  const store = useThemeStore();

  return {
    theme: store.theme,
    primaryColor: store.primaryColor,
    accentColor: store.accentColor,
    isDark: store.theme === 'dark',
    setTheme: store.setTheme,
    toggleTheme: store.toggleTheme,
    setPrimaryColor: store.setPrimaryColor,
    setAccentColor: store.setAccentColor,
  };
}
