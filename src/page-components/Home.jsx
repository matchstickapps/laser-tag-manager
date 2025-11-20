'use client'

/**
 * Home Page
 * Welcome screen with navigation to different interfaces
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../contexts/GameContext';
import { usePending } from '../contexts/PendingContext';

const Home = () => {
  const router = useRouter();
  const { getActiveSession } = useGame();
  const { getPendingCount } = usePending();

  const activeSession = getActiveSession();
  const pendingCount = getPendingCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">
            Laser Tag Stats Manager
          </h1>
          <p className="text-xl text-white opacity-90">
            Track, manage, and display player statistics in real-time
          </p>
        </div>

        {/* Session status */}
        {activeSession && (
          <div className="mb-8 text-center">
            <div className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
              <p className="text-lg font-semibold">
                🎮 Active Session: {activeSession.name}
              </p>
            </div>
          </div>
        )}

        {/* Navigation cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Player Upload */}
          <NavigationCard
            title="Upload Stats"
            description="Scan your gun's QR code and upload your game stats"
            icon="📸"
            onClick={() => router.push('/upload')}
            color="from-green-400 to-green-600"
          />

          {/* Manager Dashboard */}
          <NavigationCard
            title="Manager Dashboard"
            description="Approve stats, manage sessions, and view leaderboards"
            icon="⚙️"
            onClick={() => router.push('/dashboard')}
            color="from-blue-400 to-blue-600"
            badge={pendingCount > 0 ? `${pendingCount} pending` : null}
          />

          {/* Presentation View */}
          <NavigationCard
            title="Presentation View"
            description="Full-screen display for TV or projector"
            icon="📺"
            onClick={() => router.push('/presentation')}
            color="from-purple-400 to-purple-600"
          />

          {/* About */}
          <NavigationCard
            title="About"
            description="Learn how to use this application"
            icon="ℹ️"
            onClick={() => {/* Could open modal or navigate to help page */}}
            color="from-gray-400 to-gray-600"
          />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-white opacity-75">
          <p className="text-sm">
            Built with Next.js • OCR powered by Google Cloud Vision API
          </p>
        </div>
      </div>
    </div>
  );
};

const NavigationCard = ({ title, description, icon, onClick, color, badge }) => (
  <div
    onClick={onClick}
    className={`bg-gradient-to-br ${color} rounded-xl p-8 shadow-2xl cursor-pointer transform transition-all hover:scale-105 hover:shadow-3xl relative`}
  >
    {badge && (
      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
        {badge}
      </div>
    )}

    <div className="text-6xl mb-4">{icon}</div>
    <h2 className="text-3xl font-bold text-white mb-3">{title}</h2>
    <p className="text-white opacity-90">{description}</p>

    <div className="mt-6 flex items-center text-white font-semibold">
      <span>Open</span>
      <span className="ml-2">→</span>
    </div>
  </div>
);

export default Home;
