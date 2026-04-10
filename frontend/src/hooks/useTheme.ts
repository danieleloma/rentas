'use client';

import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const THEME_KEY = 'rentas-theme';

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      applyTheme(stored);
      setReady(true);
      return;
    }

    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial: Theme = systemDark ? 'dark' : 'light';
    setTheme(initial);
    applyTheme(initial);
    localStorage.setItem(THEME_KEY, initial);
    setReady(true);
  }, []);

  const setAndPersistTheme = useCallback((next: Theme) => {
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setAndPersistTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setAndPersistTheme, theme]);

  return { theme, setTheme: setAndPersistTheme, toggleTheme, ready };
}
