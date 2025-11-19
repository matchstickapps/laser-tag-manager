/**
 * Session Controls Component
 * Create, start, stop, pause game sessions
 */

import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';

export const SessionControls = () => {
  const { getActiveSession, getSessions, createSession, startSession, pauseSession, stopSession } = useGame();

  const [sessionName, setSessionName] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    setActiveSession(getActiveSession());
  }, [getSessions()]);

  // Update elapsed time every second
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'active') return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - activeSession.startTime;
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const handleCreateAndStart = () => {
    if (!sessionName.trim()) {
      alert('Please enter a session name');
      return;
    }

    const session = createSession(sessionName.trim());
    startSession(session.id);
    setSessionName('');
    setActiveSession(getActiveSession());
  };

  const handlePause = () => {
    if (activeSession) {
      pauseSession(activeSession.id);
      setActiveSession(getActiveSession());
    }
  };

  const handleResume = () => {
    if (activeSession) {
      startSession(activeSession.id);
      setActiveSession(getActiveSession());
    }
  };

  const handleStop = () => {
    if (activeSession && window.confirm('Are you sure you want to stop this session?')) {
      stopSession(activeSession.id);
      setActiveSession(null);
      setElapsedTime(0);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Session Controls</h2>

      {!activeSession ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Name
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Friday Night Battle"
              className="input w-full"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateAndStart()}
            />
          </div>

          <button
            onClick={handleCreateAndStart}
            className="btn-success w-full"
          >
            Create & Start Session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Active Session:</span>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  activeSession.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {activeSession.status.toUpperCase()}
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900 mb-3">{activeSession.name}</p>

            <div className="flex items-center justify-center bg-white rounded-lg p-3">
              <span className="text-3xl font-mono font-bold text-gray-900">
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {activeSession.status === 'active' ? (
              <button onClick={handlePause} className="btn-secondary flex-1">
                Pause
              </button>
            ) : (
              <button onClick={handleResume} className="btn-success flex-1">
                Resume
              </button>
            )}

            <button onClick={handleStop} className="btn-danger flex-1">
              Stop Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
