/**
 * Manager Dashboard Page
 * Main interface for managing sessions, approving stats, and viewing players
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionControls } from '../components/dashboard/SessionControls';
import { ApprovalQueue } from '../components/dashboard/ApprovalQueue';
import { ApprovalModal } from '../components/dashboard/ApprovalModal';
import { PlayerTable } from '../components/dashboard/PlayerTable';
import { Leaderboard } from '../components/dashboard/Leaderboard';
import { usePending } from '../contexts/PendingContext';

const Dashboard = () => {
  const router = useRouter();
  const { getPendingCount } = usePending();

  const [selectedPending, setSelectedPending] = useState(null);
  const [activeTab, setActiveTab] = useState('approval'); // approval, players, leaderboard

  const pendingCount = getPendingCount();

  const handleSelectPending = (pending) => {
    setSelectedPending(pending);
  };

  const handleCloseModal = () => {
    setSelectedPending(null);
  };

  const handleApproved = () => {
    setSelectedPending(null);
    // Auto-select next pending if available
    const remaining = getPendingCount();
    if (remaining > 0) {
      // Could auto-open next one here
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manager Dashboard
            </h1>
            <p className="text-gray-600">
              Manage sessions, approve stats, and track player performance
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/presentation')}
              className="btn-secondary"
            >
              Presentation View
            </button>
            <button
              onClick={() => router.push('/')}
              className="btn-secondary"
            >
              Home
            </button>
          </div>
        </div>

        {/* Session Controls */}
        <div className="mb-6">
          <SessionControls />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('approval')}
              className={`pb-3 px-2 font-semibold relative ${
                activeTab === 'approval'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Approval Queue
              {pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`pb-3 px-2 font-semibold ${
                activeTab === 'leaderboard'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Leaderboard
            </button>

            <button
              onClick={() => setActiveTab('players')}
              className={`pb-3 px-2 font-semibold ${
                activeTab === 'players'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Players
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'approval' && (
            <ApprovalQueue onSelectPending={handleSelectPending} />
          )}

          {activeTab === 'leaderboard' && (
            <Leaderboard />
          )}

          {activeTab === 'players' && (
            <PlayerTable />
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {selectedPending && (
        <ApprovalModal
          pending={selectedPending}
          onClose={handleCloseModal}
          onApproved={handleApproved}
        />
      )}
    </div>
  );
};

export default Dashboard;
