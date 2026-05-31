import type { Theme } from '../types/index';

interface ThemeToggleProps {
  theme: Theme;
  toggle: () => void;
}

/**
 * ThemeToggle — botón accesible para alternar entre tema claro y oscuro.
 *
 * Recibe `theme` y `toggle` como props (no llama a useTheme directamente)
 * para facilitar los tests.
 */
function ThemeToggle({ theme, toggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';
  const label = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  const icon = isDark ? 'Claro' : 'Oscuro';

  return (
    <button
      type="button"
      aria-label={label}
      onClick={toggle}
      className="theme-toggle"
    >
      {icon}
    </button>
  );
}

export default ThemeToggle;
