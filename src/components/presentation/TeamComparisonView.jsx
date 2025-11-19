/**
 * Presentation Team Comparison View
 * Side-by-side team statistics
 */

import React from 'react';
import { calculateTeamStats } from '../../utils/statsCalculator';

export const TeamComparisonView = ({ players }) => {
  const teamStats = calculateTeamStats(players);

  const Team = ({ teamId, stats, color }) => (
    <div className={`flex-1 ${color} rounded-xl p-12 shadow-2xl`}>
      <div className="text-center mb-12">
        <h2 className="text-6xl font-bold text-white mb-4">
          {teamId === '1A' ? '🔴 RED TEAM' : '🔵 BLUE TEAM'}
        </h2>
        <p className="text-3xl text-white opacity-90">
          {stats.playerCount} Players
        </p>
      </div>

      <div className="space-y-8">
        <StatRow label="Total Tags" value={stats.totalTags} />
        <StatRow label="Total Deaths" value={stats.totalDeactivations} />
        <StatRow label="Total Score" value={stats.totalScore} />
        <StatRow label="Avg Accuracy" value={`${stats.avgAccuracy}%`} />
        <StatRow label="Avg K/D" value={stats.avgKD.toFixed(2)} />
      </div>
    </div>
  );

  const StatRow = ({ label, value }) => (
    <div className="bg-white bg-opacity-20 rounded-lg p-6">
      <p className="text-2xl text-white opacity-75 mb-2">{label}</p>
      <p className="text-6xl font-bold text-white">{value}</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-6xl font-bold text-center mb-12 text-gray-900">
        TEAM BATTLE
      </h1>

      <div className="flex-1 flex gap-8">
        <Team
          teamId="1A"
          stats={teamStats['1A']}
          color="bg-gradient-to-br from-red-500 to-red-700"
        />

        <div className="flex items-center justify-center w-32">
          <div className="text-8xl font-bold text-gray-400">VS</div>
        </div>

        <Team
          teamId="1B"
          stats={teamStats['1B']}
          color="bg-gradient-to-br from-blue-500 to-blue-700"
        />
      </div>
    </div>
  );
};
