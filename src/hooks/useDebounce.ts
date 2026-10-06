import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any rapidly changing value (e.g. input text).
 * Returns the debounced value after delay (default 400ms).
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
