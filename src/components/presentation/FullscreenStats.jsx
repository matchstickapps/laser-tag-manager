/**
 * Fullscreen Stats Wrapper
 * Container for presentation views with auto-rotation
 */

import React, { useState, useEffect } from 'react';
import { LeaderboardView } from './LeaderboardView';
import { TeamComparisonView } from './TeamComparisonView';
import { RecentActivityView } from './RecentActivityView';

export const FullscreenStats = ({ players, autoRotate = true, rotationInterval = 30000 }) => {
  const [currentView, setCurrentView] = useState(0);

  const views = [
    { name: 'Leaderboard', component: LeaderboardView },
    { name: 'Team Comparison', component: TeamComparisonView },
    { name: 'Recent Activity', component: RecentActivityView }
  ];

  // Auto-rotate views
  useEffect(() => {
    if (!autoRotate) return;

    const timer = setInterval(() => {
      setCurrentView((prev) => (prev + 1) % views.length);
    }, rotationInterval);

    return () => clearInterval(timer);
  }, [autoRotate, rotationInterval]);

  const CurrentViewComponent = views[currentView].component;

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with view name */}
      <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-90 shadow-md z-10 py-4 px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {views.map((view, index) => (
              <button
                key={view.name}
                onClick={() => setCurrentView(index)}
                className={`px-6 py-2 rounded-lg font-semibold text-lg transition-all ${
                  currentView === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {view.name}
              </button>
            ))}
          </div>

          <button
            onClick={handleFullscreen}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-semibold"
          >
            Toggle Fullscreen
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="pt-24 pb-12 px-12 h-full">
        <div className="h-full animate-fade-in">
          <CurrentViewComponent players={players} />
        </div>
      </div>

      {/* Footer with QR code hint */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-lg px-4 py-2 shadow-md">
        <p className="text-sm text-gray-600">
          Scan QR code on your gun → Upload stats
        </p>
      </div>

      {/* Auto-rotate indicator */}
      {autoRotate && (
        <div className="absolute bottom-4 left-4 bg-blue-100 text-blue-700 rounded-lg px-4 py-2 shadow-md">
          <p className="text-sm font-medium">
            Auto-rotating views • {rotationInterval / 1000}s
          </p>
        </div>
      )}
    </div>
  );
};
