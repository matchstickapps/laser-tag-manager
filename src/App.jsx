/**
 * Main App Component
 * Sets up routing and context providers
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { PendingProvider } from './contexts/PendingContext';

import { Home } from './pages/Home';
import { PlayerUpload } from './pages/PlayerUpload';
import { Dashboard } from './pages/Dashboard';
import { Presentation } from './pages/Presentation';
import MaintenanceScreen from './components/common/MaintenanceScreen';

function App() {
  // Check if maintenance mode is enabled
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  // Show maintenance screen if enabled
  if (isMaintenanceMode) {
    return <MaintenanceScreen />;
  }

  return (
    <Router>
      <GameProvider>
        <PlayerProvider>
          <PendingProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<PlayerUpload />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/presentation" element={<Presentation />} />
            </Routes>
          </PendingProvider>
        </PlayerProvider>
      </GameProvider>
    </Router>
  );
}

export default App;
