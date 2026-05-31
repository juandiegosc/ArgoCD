import { useEffect } from 'react';
import type { Theme, ThemeContextValue } from '../types/index';
import useLocalStorage from './useLocalStorage';

/**
 * Hook that manages the application theme (light/dark).
 *
 * - Reads and writes the theme to localStorage["theme"].
 * - Falls back to "light" if no value is stored.
 * - Applies `data-theme` attribute to `document.documentElement` on mount
 *   and whenever the theme changes.
 * - `toggle` alternates between "light" and "dark".
 *
 * @returns ThemeContextValue — current theme and toggle function
 */
function useTheme(): ThemeContextValue {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggle };
}

export default useTheme;
