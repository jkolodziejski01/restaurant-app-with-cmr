import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '@/types';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      toggleTheme: () => {
        const current = get().theme;
        const next = current === 'light' ? 'dark' : 'light';
        set({ theme: next });
        applyTheme(next);
      },
    }),
    {
      name: 'restaurant-theme',
    }
  )
);

function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const systemPrefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches;

  const isDark =
    theme === 'dark' || (theme === 'system' && systemPrefersDark);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('restaurant-theme');
  if (storedTheme) {
    try {
      const { state } = JSON.parse(storedTheme);
      applyTheme(state.theme);
    } catch {
      applyTheme('system');
    }
  }
}
