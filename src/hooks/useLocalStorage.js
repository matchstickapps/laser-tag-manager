/**
 * useSupabaseStorage Hook
 * Syncs state with Supabase via Next.js API routes
 */

import { useState, useEffect, useRef } from 'react';

const DEFAULT_DATA = {
  version: '1.0',
  sessions: [],
  players: [],
  pendingStats: [],
  guns: []
};

export const useLocalStorage = () => {
  const [data, setData] = useState(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isInitialized = useRef(false);
  const saveTimeoutRef = useRef(null);

  // Load data from API on mount
  useEffect(() => {
    const initializeData = async () => {
      if (isInitialized.current) return;
      isInitialized.current = true;

      try {
        setIsLoading(true);
        const response = await fetch('/api/data');

        if (!response.ok) {
          throw new Error('Failed to load data from server');
        }

        const loadedData = await response.json();
        setData(loadedData);
        setError(null);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Save data to API whenever it changes (with debounce)
  useEffect(() => {
    if (!isInitialized.current || isLoading) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce saves to avoid too many requests
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/data/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to save data to server');
        }
      } catch (err) {
        console.error('Failed to save data:', err);
        setError(err.message);
      }
    }, 500); // 500ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, isLoading]);

  const updateData = (updater) => {
    setData(prevData => {
      const newData = typeof updater === 'function' ? updater(prevData) : updater;
      return newData;
    });
  };

  return [data, updateData, { isLoading, error }];
};
