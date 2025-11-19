/**
 * Player Table Component
 * Shows all registered players with search
 */

import React, { useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import { useGame } from '../../contexts/GameContext';

export const PlayerTable = () => {
  const { getAllPlayers, removePlayer, updatePlayerName } = usePlayer();
  const { getActiveSession } = useGame();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editName, setEditName] = useState('');

  const activeSession = getActiveSession();
  const allPlayers = getAllPlayers();

  // Filter by active session if exists
  const players = allPlayers.filter(p =>
    !activeSession || p.currentSessionId === activeSession.id
  );

  // Apply search filter
  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.gunId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditStart = (player) => {
    setEditingPlayerId(player.id);
    setEditName(player.name);
  };

  const handleEditSave = (playerId) => {
    if (editName.trim()) {
      updatePlayerName(playerId, editName.trim());
    }
    setEditingPlayerId(null);
  };

  const handleRemove = (playerId, playerName) => {
    if (window.confirm(`Remove ${playerName} from this session?`)) {
      removePlayer(playerId);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Players</h2>
        <span className="text-sm text-gray-600">
          {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or gun ID..."
          className="input w-full"
        />
      </div>

      {/* Table */}
      {filteredPlayers.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No players found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Name</th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Gun ID</th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Team</th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Tags</th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Deaths</th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">K/D</th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Last Updated</th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => (
                <tr key={player.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3">
                    {editingPlayerId === player.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => handleEditSave(player.id)}
                        onKeyPress={(e) => e.key === 'Enter' && handleEditSave(player.id)}
                        className="input text-sm py-1 w-full"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{player.name}</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">{player.gunId}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        player.teamId === '1A'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {player.teamId === '1A' ? 'Red' : 'Blue'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-sm font-semibold">{player.stats.tags}</td>
                  <td className="py-2 px-3 text-sm font-semibold">{player.stats.deactivations}</td>
                  <td className="py-2 px-3 text-sm font-semibold">{player.stats.kdRatio.toFixed(2)}</td>
                  <td className="py-2 px-3 text-xs text-gray-500">
                    {formatTimestamp(player.lastUpdated)}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditStart(player)}
                        className="text-blue-600 hover:text-blue-700 text-xs px-2 py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemove(player.id, player.name)}
                        className="text-red-600 hover:text-red-700 text-xs px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
