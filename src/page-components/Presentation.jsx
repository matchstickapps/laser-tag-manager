'use client'

/**
 * Presentation Page
 * Full-screen display for TV/projector
 */

import React, { useState } from 'react';
import { FullscreenStats } from '../components/presentation/FullscreenStats';
import { usePlayer } from '../contexts/PlayerContext';
import { useGame } from '../contexts/GameContext';
import { usePolling } from '../hooks/usePolling';

const Presentation = () => {
  const { getAllPlayers, getPlayersBySession } = usePlayer();
  const { getActiveSession } = useGame();

  const [players, setPlayers] = useState([]);

  // Poll for updates every 5 seconds
  usePolling(() => {
    const activeSession = getActiveSession();
    if (activeSession) {
      const sessionPlayers = getPlayersBySession(activeSession.id);
      setPlayers(sessionPlayers);
    } else {
      setPlayers(getAllPlayers());
    }
  }, 5000);

  return (
    <FullscreenStats
      players={players}
      autoRotate={true}
      rotationInterval={30000}
    />
  );
};

export default Presentation;
