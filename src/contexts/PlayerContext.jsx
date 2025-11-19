/**
 * Player Context
 * Manages player data and operations
 */

import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { calculateKDRatio, calculateScore, normalizeStats } from '../utils/statsCalculator';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const [data, updateData] = useLocalStorage();

  // Player operations
  const createPlayer = (gunId, name, sessionId, teamId = '1A') => {
    const newPlayer = {
      id: `player-${Date.now()}`,
      gunId,
      name,
      teamId,
      currentSessionId: sessionId,
      stats: {
        hp: { current: 0, max: 0 },
        ammo: { current: 0, max: 0 },
        reloads: 'UNLIMITED',
        tags: 0,
        deactivations: 0,
        accuracy: 0,
        respawns: 0,
        kdRatio: 0,
        score: 0
      },
      history: [],
      lastUpdated: Date.now()
    };

    updateData(prev => ({
      ...prev,
      players: [...prev.players, newPlayer]
    }));

    return newPlayer;
  };

  const updatePlayerStats = (playerId, newStats) => {
    updateData(prev => {
      const player = prev.players.find(p => p.id === playerId);
      if (!player) return prev;

      // Archive current stats to history
      const historyEntry = {
        sessionId: player.currentSessionId,
        stats: { ...player.stats },
        timestamp: player.lastUpdated
      };

      return {
        ...prev,
        players: prev.players.map(p =>
          p.id === playerId
            ? {
                ...p,
                stats: newStats,
                history: [...p.history, historyEntry],
                lastUpdated: Date.now()
              }
            : p
        )
      };
    });
  };

  const updatePlayerName = (playerId, name) => {
    updateData(prev => ({
      ...prev,
      players: prev.players.map(p =>
        p.id === playerId ? { ...p, name } : p
      )
    }));
  };

  const updatePlayerTeam = (playerId, teamId) => {
    updateData(prev => ({
      ...prev,
      players: prev.players.map(p =>
        p.id === playerId ? { ...p, teamId } : p
      )
    }));
  };

  const removePlayer = (playerId) => {
    updateData(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== playerId)
    }));
  };

  const getPlayer = (playerId) => {
    return data.players.find(p => p.id === playerId);
  };

  const getPlayerByGunId = (gunId) => {
    return data.players.find(p => p.gunId === gunId);
  };

  const getPlayersBySession = (sessionId) => {
    return data.players.filter(p => p.currentSessionId === sessionId);
  };

  const getAllPlayers = () => {
    return data.players;
  };

  const value = {
    players: data.players,
    createPlayer,
    updatePlayerStats,
    updatePlayerName,
    updatePlayerTeam,
    removePlayer,
    getPlayer,
    getPlayerByGunId,
    getPlayersBySession,
    getAllPlayers
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};
