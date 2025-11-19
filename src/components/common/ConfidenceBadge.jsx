/**
 * Confidence Badge Component
 * Shows confidence level with color coding
 */

import React from 'react';

export const ConfidenceBadge = ({ confidence }) => {
  const percentage = Math.round(confidence * 100);

  let bgColor, textColor, icon;

  if (confidence >= 0.8) {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
    icon = '✓';
  } else if (confidence >= 0.5) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
    icon = '⚠';
  } else {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    icon = '✗';
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${bgColor} ${textColor}`}>
      <span className="mr-1">{icon}</span>
      {percentage}%
    </span>
  );
};
