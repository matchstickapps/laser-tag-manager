/**
 * Image Preview Component
 * Shows captured image with extracted stats
 */

import React from 'react';
import { ConfidenceBadge } from '../common/ConfidenceBadge';

export const ImagePreview = ({ capturedImage, extractedStats, onSubmit, onRetry }) => {
  const formatAmmo = (ammo) => {
    if (typeof ammo === 'string') return ammo;
    if (typeof ammo === 'object' && ammo.current !== undefined) {
      return `${ammo.current} / ${ammo.max}`;
    }
    return 'N/A';
  };

  return (
    <div className="card mt-6">
      <h3 className="text-lg font-semibold mb-4">Preview Captured Stats</h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Captured image */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Captured Image:</p>
          <img
            src={capturedImage}
            alt="Captured gun display"
            className="w-full rounded-lg border border-gray-300"
          />
        </div>

        {/* Extracted stats */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Extracted Stats:</p>

          <div className="space-y-3">
            <StatRow
              label="HP"
              value={`${extractedStats.hp.current} / ${extractedStats.hp.max}`}
              confidence={extractedStats.hp.confidence}
            />

            <StatRow
              label="Ammo"
              value={formatAmmo(extractedStats.ammo.value)}
              confidence={extractedStats.ammo.confidence}
            />

            <StatRow
              label="Reloads"
              value={extractedStats.reloads.value}
              confidence={extractedStats.reloads.confidence}
            />

            <StatRow
              label="Tags (Kills)"
              value={extractedStats.tags.value}
              confidence={extractedStats.tags.confidence}
            />

            <StatRow
              label="Deactivations (Deaths)"
              value={extractedStats.deactivations.value}
              confidence={extractedStats.deactivations.confidence}
            />

            <StatRow
              label="Accuracy"
              value={`${extractedStats.accuracy.value}%`}
              confidence={extractedStats.accuracy.confidence}
            />

            <StatRow
              label="Team"
              value={extractedStats.team.value === '1A' ? '1A (Red)' : '1B (Blue)'}
              confidence={extractedStats.team.confidence}
            />

            <StatRow
              label="Respawns"
              value={extractedStats.respawns.value}
              confidence={extractedStats.respawns.confidence}
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <button onClick={onSubmit} className="btn-success flex-1">
          Submit for Approval
        </button>
        <button onClick={onRetry} className="btn-secondary">
          Retry Capture
        </button>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, confidence }) => (
  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
    <span className="text-sm font-medium text-gray-700">{label}:</span>
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold">{value}</span>
      <ConfidenceBadge confidence={confidence} />
    </div>
  </div>
);
