import { useState, useEffect } from 'react';
import type { RouteKey } from '../types/index';

/**
 * Maps a window.location.hash string to a RouteKey.
 * Recognized hashes:
 *   '' | '#/' | '#/home'  → 'home'
 *   '#/tasks'             → 'tasks'
 *   '#/counter'           → 'counter'
 *   '#/editor'            → 'editor'
 * Any unrecognized hash falls back to 'home'.
 */
function resolveHash(hash: string): RouteKey {
  switch (hash) {
    case '':
    case '#/':
    case '#/home':
      return 'home';
    case '#/tasks':
      return 'tasks';
    case '#/counter':
      return 'counter';
    case '#/editor':
      return 'editor';
    default:
      return 'home';
  }
}

/**
 * Hook that reads the current URL hash and listens for hash changes,
 * returning the active RouteKey. Falls back to 'home' for empty or
 * unrecognized hashes.
 *
 * @returns The active RouteKey derived from window.location.hash
 */
function useHashRouter(): RouteKey {
  const [route, setRoute] = useState<RouteKey>(() =>
    resolveHash(window.location.hash)
  );

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(resolveHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);

    // Cleanup: remove listener when component unmounts
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return route;
}

export default useHashRouter;
export { resolveHash };
