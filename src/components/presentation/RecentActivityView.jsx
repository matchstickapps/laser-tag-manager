/**
 * Presentation Recent Activity View
 * Shows latest stat updates
 */

import React from 'react';

export const RecentActivityView = ({ players }) => {
  // Sort by last updated and take top 5
  const recentPlayers = [...players]
    .sort((a, b) => b.lastUpdated - a.lastUpdated)
    .slice(0, 5);

  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes === 0) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-6xl font-bold text-center mb-12 text-gray-900">
        RECENT ACTIVITY
      </h1>

      <div className="flex-1 overflow-hidden">
        <div className="space-y-6">
          {recentPlayers.map((player, index) => (
            <div
              key={player.id}
              className="bg-white rounded-xl p-8 shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-8">
                {/* Time indicator */}
                <div className="flex-shrink-0 w-32">
                  <div className="bg-blue-100 rounded-lg p-4 text-center">
                    <p className="text-xl text-blue-600 font-semibold">
                      {formatTime(player.lastUpdated)}
                    </p>
                  </div>
                </div>

                {/* Player info */}
                <div className="flex-1">
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    {player.name}
                  </p>
                  <p className="text-2xl text-gray-600">
                    {player.teamId === '1A' ? '🔴 Red Team' : '🔵 Blue Team'}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-6">
                  <div className="text-center bg-green-50 rounded-lg p-4 min-w-[120px]">
                    <p className="text-xl text-green-600 mb-1">Tags</p>
                    <p className="text-4xl font-bold text-green-700">
                      {player.stats.tags}
                    </p>
                  </div>

                  <div className="text-center bg-red-50 rounded-lg p-4 min-w-[120px]">
                    <p className="text-xl text-red-600 mb-1">Deaths</p>
                    <p className="text-4xl font-bold text-red-700">
                      {player.stats.deactivations}
                    </p>
                  </div>

                  <div className="text-center bg-purple-50 rounded-lg p-4 min-w-[120px]">
                    <p className="text-xl text-purple-600 mb-1">Accuracy</p>
                    <p className="text-4xl font-bold text-purple-700">
                      {player.stats.accuracy}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recentPlayers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl text-gray-400">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};
