export function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme, colors = {}) {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  const effectiveTheme = theme === 'auto' ? getSystemTheme() : theme;

  // Apply theme class
  root.classList.remove('light', 'dark');
  root.classList.add(effectiveTheme);
  root.style.colorScheme = effectiveTheme;

  // Apply CSS Variables for custom colors if provided
  if (colors.primary) root.style.setProperty('--primary-color', colors.primary);
  if (colors.accent) root.style.setProperty('--accent-color', colors.accent);
}

export function isValidColor(color) {
  return /^#[0-9A-F]{6}$/i.test(color);
}

export function contrastColor(bgColor) {
  if (!bgColor || bgColor.length < 7) return '#000000';
  
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  
  // Calculate brightness (YIQ formula)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#FFFFFF';
}
