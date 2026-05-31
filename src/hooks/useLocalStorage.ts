import { useState } from 'react';

/**
 * Generic hook that wraps localStorage with JSON serialization and silent error handling.
 * If localStorage is unavailable (private mode, quota exceeded, etc.), the hook
 * falls back to in-memory state without throwing.
 *
 * @param key - The localStorage key to read/write
 * @param initialValue - Value used when the key is absent or localStorage is unavailable
 * @returns A stateful value and a setter that syncs both React state and localStorage
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, (v: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      // localStorage unavailable or JSON parse error — use initial value
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setState(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently fail — in-memory state remains valid even if persistence fails
      setState(value);
    }
  };

  return [state, setValue];
}

export default useLocalStorage;
