/**
 * Leaderboard Component
 * Sorted player rankings with filters
 */

import React, { useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import { useGame } from '../../contexts/GameContext';
import { sortPlayers } from '../../utils/statsCalculator';

export const Leaderboard = () => {
  const { getAllPlayers } = usePlayer();
  const { getActiveSession } = useGame();

  const [sortBy, setSortBy] = useState('score');
  const [filterTeam, setFilterTeam] = useState('all');

  const activeSession = getActiveSession();
  const allPlayers = getAllPlayers();

  // Filter by active session if exists
  let players = allPlayers.filter(p =>
    !activeSession || p.currentSessionId === activeSession.id
  );

  // Filter by team
  if (filterTeam !== 'all') {
    players = players.filter(p => p.teamId === filterTeam);
  }

  // Sort players
  const sortedPlayers = sortPlayers(players, sortBy, 'desc');

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Leaderboard</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-600 block mb-1">Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input text-sm"
          >
            <option value="score">Score</option>
            <option value="tags">Tags (Kills)</option>
            <option value="kd">K/D Ratio</option>
            <option value="accuracy">Accuracy</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-600 block mb-1">Team:</label>
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="input text-sm"
          >
            <option value="all">All Teams</option>
            <option value="1A">Red Team</option>
            <option value="1B">Blue Team</option>
          </select>
        </div>
      </div>

      {/* Leaderboard */}
      {sortedPlayers.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No players to display</p>
      ) : (
        <div className="space-y-2">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center gap-4 p-3 rounded-lg ${
                index < 3
                  ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-300'
                  : 'bg-gray-50'
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-8 text-center">
                {index < 3 ? (
                  <span className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                )}
              </div>

              {/* Player info */}
              <div className="flex-1">
                <p className="font-bold text-gray-900">{player.name}</p>
                <p className="text-xs text-gray-600">
                  {player.teamId === '1A' ? 'Red Team' : 'Blue Team'}
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Score</p>
                  <p className="font-bold text-gray-900">{player.stats.score}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Tags</p>
                  <p className="font-bold text-gray-900">{player.stats.tags}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">K/D</p>
                  <p className="font-bold text-gray-900">{player.stats.kdRatio.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Accuracy</p>
                  <p className="font-bold text-gray-900">{player.stats.accuracy}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
