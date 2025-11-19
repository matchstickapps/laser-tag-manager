/**
 * Pending Context
 * Manages pending stats submissions and approval queue
 */

import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const PendingContext = createContext();

export const usePending = () => {
  const context = useContext(PendingContext);
  if (!context) {
    throw new Error('usePending must be used within PendingProvider');
  }
  return context;
};

export const PendingProvider = ({ children }) => {
  const [data, updateData] = useLocalStorage();

  // Pending stats operations
  const addPendingStats = (playerId, sessionId, capturedImage, extractedStats) => {
    const newPending = {
      id: `pending-${Date.now()}`,
      playerId,
      sessionId,
      capturedImage,
      extractedStats,
      timestamp: Date.now(),
      status: 'pending'
    };

    updateData(prev => ({
      ...prev,
      pendingStats: [...prev.pendingStats, newPending]
    }));

    return newPending;
  };

  const approvePending = (pendingId) => {
    updateData(prev => ({
      ...prev,
      pendingStats: prev.pendingStats.map(p =>
        p.id === pendingId
          ? { ...p, status: 'approved' }
          : p
      )
    }));
  };

  const rejectPending = (pendingId) => {
    updateData(prev => ({
      ...prev,
      pendingStats: prev.pendingStats.map(p =>
        p.id === pendingId
          ? { ...p, status: 'rejected' }
          : p
      )
    }));
  };

  const updatePendingStats = (pendingId, newExtractedStats) => {
    updateData(prev => ({
      ...prev,
      pendingStats: prev.pendingStats.map(p =>
        p.id === pendingId
          ? { ...p, extractedStats: newExtractedStats }
          : p
      )
    }));
  };

  const deletePending = (pendingId) => {
    updateData(prev => ({
      ...prev,
      pendingStats: prev.pendingStats.filter(p => p.id !== pendingId)
    }));
  };

  const getPendingStats = () => {
    return data.pendingStats.filter(p => p.status === 'pending');
  };

  const getPendingById = (pendingId) => {
    return data.pendingStats.find(p => p.id === pendingId);
  };

  const getPendingCount = () => {
    return data.pendingStats.filter(p => p.status === 'pending').length;
  };

  const clearOldPending = (daysOld = 7) => {
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    updateData(prev => ({
      ...prev,
      pendingStats: prev.pendingStats.filter(p => {
        return p.timestamp > cutoffDate || p.status === 'pending';
      })
    }));
  };

  const value = {
    pendingStats: data.pendingStats,
    addPendingStats,
    approvePending,
    rejectPending,
    updatePendingStats,
    deletePending,
    getPendingStats,
    getPendingById,
    getPendingCount,
    clearOldPending
  };

  return <PendingContext.Provider value={value}>{children}</PendingContext.Provider>;
};
