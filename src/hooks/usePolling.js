/**
 * usePolling Hook
 * Polls for data updates at specified interval
 */

import { useEffect, useRef } from 'react';

export const usePolling = (callback, interval = 3000, enabled = true) => {
  const savedCallback = useRef(callback);

  // Update callback ref if it changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    // Call immediately on mount
    savedCallback.current();

    // Set up interval
    const id = setInterval(() => {
      savedCallback.current();
    }, interval);

    return () => clearInterval(id);
  }, [interval, enabled]);
};
