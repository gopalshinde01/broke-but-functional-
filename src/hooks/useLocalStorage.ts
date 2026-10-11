import { useState, useCallback } from 'react';

/**
 * Reusable hook for persisting and retrieving state from localStorage
 * with graceful recovery on corrupt data.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validator?: (value: unknown) => value is T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;
      const parsed = JSON.parse(item);
      if (validator && !validator(parsed)) {
        console.warn(`useLocalStorage: Data validation failed for key "${key}". Falling back.`);
        return initialValue;
      }
      return parsed as T;
    } catch (error) {
      console.error(`useLocalStorage: Failed to read "${key}"`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch (error) {
        console.error(`useLocalStorage: Failed to write "${key}"`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}
