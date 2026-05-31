import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import AppCard from './AppCard';

describe('AppCard', () => {
  describe('heading renders', () => {
    it('renders the application name as an accessible h1 heading', () => {
      render(<AppCard />);
      const heading = screen.getByRole('heading', { level: 1, name: /React Demo/i });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('version from environment variable', () => {
    it('renders the version string from VITE_APP_VERSION', () => {
      // Stub the env before rendering
      vi.stubEnv('VITE_APP_VERSION', '9.9.9');
      render(<AppCard />);
      const versionEl = screen.getByTestId('version');
      expect(versionEl).toHaveTextContent('v9.9.9');
    });

    it('renders fallback text when VITE_APP_VERSION is undefined', () => {
      vi.stubEnv('VITE_APP_VERSION', '');
      render(<AppCard />);
      const versionEl = screen.getByTestId('version');
      // Must not throw, must show a visible placeholder
      expect(versionEl).toBeInTheDocument();
      // The text must be either "vdev" or "vunknown" — not just "v"
      expect(versionEl.textContent).toMatch(/v(dev|unknown)/);
    });
  });

  describe('Kubernetes status badge', () => {
    it('renders a status badge with "Running on Kubernetes" text', () => {
      render(<AppCard />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('Running on Kubernetes');
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });
});
