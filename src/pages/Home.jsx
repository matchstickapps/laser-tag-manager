/**
 * Home Page
 * Welcome screen with navigation to different interfaces
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { usePending } from '../contexts/PendingContext';
import { ApiKeySettings } from '../components/common/ApiKeySettings';
import { getApiKey } from '../utils/cloudVisionOCR';

export const Home = () => {
  const navigate = useNavigate();
  const { getActiveSession } = useGame();
  const { getPendingCount } = usePending();

  const [showApiSettings, setShowApiSettings] = useState(false);

  const activeSession = getActiveSession();
  const pendingCount = getPendingCount();
  const hasApiKey = !!getApiKey();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Settings Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowApiSettings(true)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-all"
          >
            ⚙️ API Settings
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">
            Laser Tag Stats Manager
          </h1>
          <p className="text-xl text-white opacity-90">
            Track, manage, and display player statistics in real-time
          </p>
        </div>

        {/* API Key Warning */}
        {!hasApiKey && (
          <div className="mb-8 bg-yellow-400 text-yellow-900 rounded-lg p-4 text-center">
            <p className="font-semibold mb-2">⚠️ Google Cloud Vision API Key Required</p>
            <p className="text-sm mb-3">
              You need to configure your API key before uploading stats.
            </p>
            <button
              onClick={() => setShowApiSettings(true)}
              className="bg-yellow-900 text-yellow-100 px-4 py-2 rounded-lg hover:bg-yellow-800 font-medium"
            >
              Configure Now
            </button>
          </div>
        )}

        {/* Session status */}
        {activeSession && (
          <div className="mb-8 text-center">
            <div className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
              <p className="text-lg font-semibold">
                🎮 Active Session: {activeSession.name}
              </p>
            </div>
          </div>
        )}

        {/* Navigation cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Player Upload */}
          <NavigationCard
            title="Upload Stats"
            description="Scan your gun's QR code and upload your game stats"
            icon="📸"
            onClick={() => navigate('/upload')}
            color="from-green-400 to-green-600"
          />

          {/* Manager Dashboard */}
          <NavigationCard
            title="Manager Dashboard"
            description="Approve stats, manage sessions, and view leaderboards"
            icon="⚙️"
            onClick={() => navigate('/dashboard')}
            color="from-blue-400 to-blue-600"
            badge={pendingCount > 0 ? `${pendingCount} pending` : null}
          />

          {/* Presentation View */}
          <NavigationCard
            title="Presentation View"
            description="Full-screen display for TV or projector"
            icon="📺"
            onClick={() => navigate('/presentation')}
            color="from-purple-400 to-purple-600"
          />

          {/* About */}
          <NavigationCard
            title="About"
            description="Learn how to use this application"
            icon="ℹ️"
            onClick={() => {/* Could open modal or navigate to help page */}}
            color="from-gray-400 to-gray-600"
          />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-white opacity-75">
          <p className="text-sm">
            Built by matchstickapps
          </p>
        </div>
      </div>

      {/* API Settings Modal */}
      {showApiSettings && (
        <ApiKeySettings onClose={() => setShowApiSettings(false)} />
      )}
    </div>
  );
};

const NavigationCard = ({ title, description, icon, onClick, color, badge }) => (
  <div
    onClick={onClick}
    className={`bg-gradient-to-br ${color} rounded-xl p-8 shadow-2xl cursor-pointer transform transition-all hover:scale-105 hover:shadow-3xl relative`}
  >
    {badge && (
      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
        {badge}
      </div>
    )}

    <div className="text-6xl mb-4">{icon}</div>
    <h2 className="text-3xl font-bold text-white mb-3">{title}</h2>
    <p className="text-white opacity-90">{description}</p>

    <div className="mt-6 flex items-center text-white font-semibold">
      <span>Open</span>
      <span className="ml-2">→</span>
    </div>
  </div>
);
