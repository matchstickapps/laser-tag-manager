/**
 * Game Context
 * Manages game sessions and global state
 */

import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [data, updateData] = useLocalStorage();

  // Session operations
  const createSession = (name) => {
    const newSession = {
      id: `session-${Date.now()}`,
      name,
      startTime: null,
      endTime: null,
      status: 'created',
      playerIds: []
    };

    updateData(prev => ({
      ...prev,
      sessions: [...prev.sessions, newSession]
    }));

    return newSession;
  };

  const startSession = (sessionId) => {
    updateData(prev => ({
      ...prev,
      sessions: prev.sessions.map(session =>
        session.id === sessionId
          ? { ...session, status: 'active', startTime: Date.now() }
          : session
      )
    }));
  };

  const pauseSession = (sessionId) => {
    updateData(prev => ({
      ...prev,
      sessions: prev.sessions.map(session =>
        session.id === sessionId
          ? { ...session, status: 'paused' }
          : session
      )
    }));
  };

  const stopSession = (sessionId) => {
    updateData(prev => ({
      ...prev,
      sessions: prev.sessions.map(session =>
        session.id === sessionId
          ? { ...session, status: 'completed', endTime: Date.now() }
          : session
      )
    }));
  };

  const deleteSession = (sessionId) => {
    updateData(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== sessionId),
      players: prev.players.filter(p => p.currentSessionId !== sessionId)
    }));
  };

  const getActiveSession = () => {
    return data.sessions.find(s => s.status === 'active');
  };

  const getSessions = () => {
    return data.sessions;
  };

  const getSession = (sessionId) => {
    return data.sessions.find(s => s.id === sessionId);
  };

  const value = {
    sessions: data.sessions,
    createSession,
    startSession,
    pauseSession,
    stopSession,
    deleteSession,
    getActiveSession,
    getSessions,
    getSession
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
