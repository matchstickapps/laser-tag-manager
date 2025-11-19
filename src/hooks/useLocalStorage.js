/**
 * useLocalStorage Hook
 * Syncs state with LocalStorage
 */

import { useState, useEffect } from 'react';
import { loadData, saveData } from '../utils/storageManager';

export const useLocalStorage = () => {
  const [data, setData] = useState(() => loadData());

  // Save to LocalStorage whenever data changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  const updateData = (updater) => {
    setData(prevData => {
      const newData = typeof updater === 'function' ? updater(prevData) : updater;
      return newData;
    });
  };

  return [data, updateData];
};
