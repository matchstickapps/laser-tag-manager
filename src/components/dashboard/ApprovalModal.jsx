/**
 * Approval Modal Component
 * Detailed view for approving/rejecting stats
 */

import React, { useState, useEffect, useCallback } from 'react';
import { usePending } from '../../contexts/PendingContext';
import { usePlayer } from '../../contexts/PlayerContext';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { normalizeStats } from '../../utils/statsCalculator';

export const ApprovalModal = ({ pending, onClose, onApproved }) => {
  const { approveAndDelete, rejectAndDelete, updatePendingStats } = usePending();
  const { getPlayer, updatePlayerStats, updatePlayerName, updatePlayerTeam } = usePlayer();

  const player = getPlayer(pending.playerId);
  const [editedStats, setEditedStats] = useState(pending.extractedStats);
  const [playerName, setPlayerName] = useState(player?.name || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleApprove = useCallback(() => {
    // Update player stats
    const normalized = normalizeStats(editedStats);
    updatePlayerStats(pending.playerId, normalized);

    // Update player name if changed
    if (playerName !== player.name) {
      updatePlayerName(pending.playerId, playerName);
    }

    // Update team if changed
    if (editedStats.team.value !== player.teamId) {
      updatePlayerTeam(pending.playerId, editedStats.team.value);
    }

    // Approve and delete in single atomic operation
    approveAndDelete(pending.id);

    // Close modal and notify parent
    onClose();
    if (onApproved) {
      onApproved();
    }
  }, [editedStats, playerName, player, pending, approveAndDelete, updatePlayerStats, updatePlayerName, updatePlayerTeam, onClose, onApproved]);

  const handleReject = useCallback(() => {
    if (window.confirm('Are you sure you want to reject this submission?')) {
      // Reject and delete in single atomic operation
      rejectAndDelete(pending.id);
      onClose();
    }
  }, [pending, rejectAndDelete, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'a' || e.key === 'A') {
        handleApprove();
      } else if (e.key === 'r' || e.key === 'R') {
        handleReject();
      } else if (e.key === 'e' || e.key === 'E') {
        setIsEditing(prev => !prev);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleApprove, handleReject, onClose]);

  const updateStat = (field, subfield, value) => {
    setEditedStats(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subfield]: value
      }
    }));
  };

  const formatAmmo = (ammo) => {
    if (typeof ammo === 'string') return ammo;
    if (typeof ammo === 'object' && ammo.current !== undefined) {
      return `${ammo.current} / ${ammo.max}`;
    }
    return 'N/A';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-5xl w-full my-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Review Stats Submission</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Image */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Captured Image:</p>
              <img
                src={pending.capturedImage}
                alt="Captured gun display"
                className="w-full rounded-lg border-2 border-gray-300"
              />

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Player Info:</p>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="input w-full mb-2"
                  placeholder="Player name"
                />
                <p className="text-xs text-gray-600">Gun ID: {player?.gunId || 'N/A'}</p>
              </div>
            </div>

            {/* Right: Editable Stats */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">Extracted Stats:</p>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isEditing ? 'View Mode' : 'Edit Mode'} (E)
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {/* HP */}
                <StatField
                  label="HP"
                  value={`${editedStats.hp.current} / ${editedStats.hp.max}`}
                  confidence={editedStats.hp.confidence}
                  isEditing={isEditing}
                  onEdit={(val) => {
                    const [current, max] = val.split('/').map(v => parseInt(v.trim()));
                    updateStat('hp', 'current', current || 0);
                    updateStat('hp', 'max', max || 0);
                  }}
                />

                {/* Ammo */}
                <StatField
                  label="Ammo"
                  value={formatAmmo(editedStats.ammo.value)}
                  confidence={editedStats.ammo.confidence}
                  isEditing={isEditing}
                  onEdit={(val) => {
                    if (val === 'EM' || val === 'UNLIMITED') {
                      updateStat('ammo', 'value', val);
                    } else {
                      const [current, max] = val.split('/').map(v => parseInt(v.trim()));
                      updateStat('ammo', 'value', { current: current || 0, max: max || 0 });
                    }
                  }}
                />

                {/* Reloads */}
                <StatField
                  label="Reloads"
                  value={editedStats.reloads.value}
                  confidence={editedStats.reloads.confidence}
                  isEditing={isEditing}
                  onEdit={(val) => {
                    const num = parseInt(val);
                    updateStat('reloads', 'value', isNaN(num) ? val : num);
                  }}
                />

                {/* Tags */}
                <StatField
                  label="Tags (Kills)"
                  value={editedStats.tags.value}
                  confidence={editedStats.tags.confidence}
                  isEditing={isEditing}
                  onEdit={(val) => updateStat('tags', 'value', parseInt(val) || 0)}
                />

                {/* Deactivations */}
                <StatField
                  label="Deactivations (Deaths)"
                  value={editedStats.deactivations.value}
                  confidence={editedStats.deactivations.confidence}
                  isEditing={isEditing}
                  onEdit={(val) => updateStat('deactivations', 'value', parseInt(val) || 0)}
                />

                {/* Accuracy */}
                <StatField
                  label="Accuracy"
                  value={`${editedStats.accuracy.value}%`}
                  confidence={editedStats.accuracy.confidence}
                  isEditing={isEditing}
                  onEdit={(val) => updateStat('accuracy', 'value', parseInt(val.replace('%', '')) || 0)}
                />

                {/* Team */}
                <StatField
                  label="Team"
                  value={editedStats.team.value === '1A' ? '1A (Red)' : '1B (Blue)'}
                  confidence={editedStats.team.confidence}
                  isEditing={isEditing}
                  onEdit={(val) => {
                    const team = val.includes('1A') ? '1A' : '1B';
                    updateStat('team', 'value', team);
                  }}
                />

                {/* Respawns */}
                <StatField
                  label="Respawns"
                  value={editedStats.respawns.value}
                  confidence={editedStats.respawns.confidence}
                  isEditing={isEditing}
                  onEdit={(val) => updateStat('respawns', 'value', parseInt(val) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button onClick={handleApprove} className="btn-success flex-1">
              Approve (A)
            </button>
            <button onClick={handleReject} className="btn-danger flex-1">
              Reject (R)
            </button>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Keyboard shortcuts:</strong> A = Approve, R = Reject, E = Edit, ESC = Close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatField = ({ label, value, confidence, isEditing, onEdit }) => {
  const [editValue, setEditValue] = useState(value.toString());

  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    if (onEdit) {
      onEdit(editValue);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <span className="text-sm font-medium text-gray-700 w-1/3">{label}:</span>
      <div className="flex items-center gap-2 flex-1">
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            className="input text-sm py-1 flex-1"
          />
        ) : (
          <span className="text-sm font-semibold flex-1">{value}</span>
        )}
        <ConfidenceBadge confidence={confidence} />
      </div>
    </div>
  );
};
