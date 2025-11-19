/**
 * Approval Queue Component
 * Shows pending stats submissions
 */

import React from 'react';
import { usePending } from '../../contexts/PendingContext';
import { usePlayer } from '../../contexts/PlayerContext';

export const ApprovalQueue = ({ onSelectPending }) => {
  const { getPendingStats, getPendingCount } = usePending();
  const { getPlayer } = usePlayer();

  const pendingList = getPendingStats();
  const count = getPendingCount();

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (count === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Approval Queue</h2>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
            0 pending
          </span>
        </div>
        <p className="text-gray-600 text-center py-8">
          No pending stats submissions
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Approval Queue</h2>
        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold animate-pulse">
          {count} pending
        </span>
      </div>

      <div className="space-y-3">
        {pendingList.map((pending) => {
          const player = getPlayer(pending.playerId);

          return (
            <div
              key={pending.id}
              onClick={() => onSelectPending(pending)}
              className="flex items-center gap-4 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-gray-200"
            >
              {/* Thumbnail */}
              <img
                src={pending.capturedImage}
                alt="Captured stats"
                className="w-20 h-20 object-cover rounded border border-gray-300"
              />

              {/* Info */}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {player ? player.name : 'Unknown Player'}
                </p>
                <p className="text-sm text-gray-600">
                  Gun ID: {player ? player.gunId : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Submitted at {formatTimestamp(pending.timestamp)}
                </p>
              </div>

              {/* Arrow */}
              <div className="text-gray-400">
                →
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
