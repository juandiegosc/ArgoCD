import { renderHook, act } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import fc from 'fast-check';
import useTheme from './useTheme';
import type { Theme } from '../types/index';

// Clean up localStorage and data-theme attribute between tests
afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

// ---------------------------------------------------------------------------
// Example tests
// ---------------------------------------------------------------------------

describe('useTheme — example tests', () => {
  it('defaults to "light" when localStorage is empty', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('applies data-theme="light" to <html> on mount', () => {
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('reads stored theme from localStorage on mount', () => {
    localStorage.setItem('theme', JSON.stringify('dark'));
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggle switches from light to dark', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggle());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggle switches from dark back to light', () => {
    localStorage.setItem('theme', JSON.stringify('dark'));
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggle());
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('persists new theme to localStorage after toggle', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggle());
    expect(JSON.parse(localStorage.getItem('theme')!)).toBe('dark');
  });
});

// ---------------------------------------------------------------------------
// Property 15: Theme — round-trip del toggle
// Validates: Requirements 6.2, 6.3
// ---------------------------------------------------------------------------

describe('Property 15: Theme toggle round-trip', () => {
  it('toggling twice restores the original theme and data-theme attribute', () => {
    // Feature: argocd-demo-dashboard, Property 15: Theme toggle round-trip
    const themes: Theme[] = ['light', 'dark'];

    fc.assert(
      fc.property(
        fc.constantFrom(...themes),
        (initialTheme) => {
          localStorage.clear();
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme', JSON.stringify(initialTheme));

          const { result, unmount } = renderHook(() => useTheme());

          // First toggle — should switch to opposite
          act(() => result.current.toggle());
          const opposite = initialTheme === 'light' ? 'dark' : 'light';
          expect(result.current.theme).toBe(opposite);
          expect(document.documentElement.getAttribute('data-theme')).toBe(opposite);

          // Second toggle — should restore original
          act(() => result.current.toggle());
          expect(result.current.theme).toBe(initialTheme);
          expect(document.documentElement.getAttribute('data-theme')).toBe(initialTheme);

          unmount();
          localStorage.clear();
          document.documentElement.removeAttribute('data-theme');
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 16: Theme — round-trip de persistencia en localStorage
// Validates: Requirements 6.4, 6.5
// ---------------------------------------------------------------------------

describe('Property 16: Theme localStorage persistence round-trip', () => {
  it('mounts with stored theme and persists new theme after toggle', () => {
    // Feature: argocd-demo-dashboard, Property 16: Theme localStorage persistence round-trip
    const themes: Theme[] = ['light', 'dark'];

    fc.assert(
      fc.property(
        fc.constantFrom(...themes),
        (storedTheme) => {
          localStorage.clear();
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme', JSON.stringify(storedTheme));

          const { result, unmount } = renderHook(() => useTheme());

          // On mount, the stored theme should be applied
          expect(result.current.theme).toBe(storedTheme);
          expect(document.documentElement.getAttribute('data-theme')).toBe(storedTheme);

          // After toggle, localStorage should immediately reflect the new value
          act(() => result.current.toggle());
          const newTheme = storedTheme === 'light' ? 'dark' : 'light';
          expect(JSON.parse(localStorage.getItem('theme')!)).toBe(newTheme);

          unmount();
          localStorage.clear();
          document.documentElement.removeAttribute('data-theme');
        }
      ),
      { numRuns: 100 }
    );
  });
});
