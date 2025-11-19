/**
 * Presentation Leaderboard View
 * Large display optimized for TV/projector
 */

import React from 'react';
import { sortPlayers } from '../../utils/statsCalculator';

export const LeaderboardView = ({ players }) => {
  const sorted = sortPlayers(players, 'score', 'desc').slice(0, 10);

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-6xl font-bold text-center mb-12 text-gray-900">
        TOP PLAYERS
      </h1>

      <div className="flex-1 overflow-hidden">
        <div className="space-y-4">
          {sorted.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center gap-6 p-6 rounded-xl transition-all ${
                index < 3
                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 shadow-lg scale-105'
                  : 'bg-white shadow-md'
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-20 text-center">
                {index < 3 ? (
                  <span className="text-6xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span className="text-5xl font-bold text-gray-400">
                    #{index + 1}
                  </span>
                )}
              </div>

              {/* Player name */}
              <div className="flex-1">
                <p className="text-4xl font-bold text-gray-900">{player.name}</p>
                <p className="text-xl text-gray-600 mt-1">
                  {player.teamId === '1A' ? '🔴 Red Team' : '🔵 Blue Team'}
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-8 text-center">
                <div>
                  <p className="text-2xl text-gray-600">SCORE</p>
                  <p className="text-5xl font-bold text-blue-600">{player.stats.score}</p>
                </div>
                <div>
                  <p className="text-2xl text-gray-600">TAGS</p>
                  <p className="text-5xl font-bold text-green-600">{player.stats.tags}</p>
                </div>
                <div>
                  <p className="text-2xl text-gray-600">K/D</p>
                  <p className="text-5xl font-bold text-purple-600">
                    {player.stats.kdRatio.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
