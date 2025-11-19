/**
 * Stat Card Component
 * Reusable card for displaying statistics
 */

import React from 'react';

export const StatCard = ({ label, value, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700'
  };

  return (
    <div className={`card ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        {icon && (
          <div className="text-3xl opacity-50">{icon}</div>
        )}
      </div>
    </div>
  );
};
