import type { RouteKey, Theme } from '../types/index';
import ThemeToggle from './ThemeToggle';

interface NavBarProps {
  activeRoute: RouteKey;
  theme: Theme;
  onToggleTheme: () => void;
}

const NAV_LINKS: { key: RouteKey; href: string; label: string }[] = [
  { key: 'home',    href: '#/home',    label: 'Inicio'   },
  { key: 'tasks',   href: '#/tasks',   label: 'Tareas'   },
  { key: 'counter', href: '#/counter', label: 'Contador' },
  { key: 'editor',  href: '#/editor',  label: 'Editor'   },
];

/**
 * NavBar — barra de navegación principal del dashboard.
 *
 * Renderiza 4 enlaces de hash-routing y el ThemeToggle.
 * El enlace correspondiente a `activeRoute` recibe `aria-current="page"`.
 */
function NavBar({ activeRoute, theme, onToggleTheme }: NavBarProps) {
  return (
    <nav aria-label="Navegación principal" className="navbar">
      <ul className="navbar__links">
        {NAV_LINKS.map(({ key, href, label }) => (
          <li key={key}>
            <a
              href={href}
              aria-current={activeRoute === key ? 'page' : undefined}
              className={`navbar__link${activeRoute === key ? ' navbar__link--active' : ''}`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
      <ThemeToggle theme={theme} toggle={onToggleTheme} />
    </nav>
  );
}

export default NavBar;
