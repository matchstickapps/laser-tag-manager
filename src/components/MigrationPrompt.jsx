/**
 * Migration Prompt Component
 * Prompts user to migrate localStorage data to Supabase
 */

import React, { useState, useEffect } from 'react';
import { needsMigration, migrateLocalStorageToSupabase, backupLocalStorageData } from '../utils/migrateToSupabase';

export const MigrationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const checkMigration = async () => {
      try {
        // Check if user already dismissed the prompt
        const dismissed = localStorage.getItem('migrationPromptDismissed');
        if (dismissed === 'true') {
          setIsDismissed(true);
          setIsChecking(false);
          return;
        }

        const needs = await needsMigration();
        setShowPrompt(needs);
      } catch (error) {
        console.error('Error checking migration:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkMigration();
  }, []);

  const handleMigrate = async () => {
    setIsMigrating(true);

    try {
      // Create backup first
      backupLocalStorageData();

      // Run migration
      const result = await migrateLocalStorageToSupabase();
      setMigrationResult(result);

      if (result.success) {
        // Wait 3 seconds then hide prompt
        setTimeout(() => {
          setShowPrompt(false);
        }, 3000);
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        message: `Migration failed: ${error.message}`
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('migrationPromptDismissed', 'true');
    setShowPrompt(false);
    setIsDismissed(true);
  };

  if (isChecking || !showPrompt || isDismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {!migrationResult ? (
          <>
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Migrate to Supabase
                </h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    We detected existing data in your browser's localStorage.
                    Would you like to migrate it to Supabase for better
                    reliability and multi-device sync?
                  </p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Cloud backup of your data</li>
                    <li>Access from any device</li>
                    <li>Better performance</li>
                    <li>Your localStorage data will be backed up first</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleMigrate}
                disabled={isMigrating}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMigrating ? 'Migrating...' : 'Migrate Now'}
              </button>
              <button
                onClick={handleDismiss}
                disabled={isMigrating}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-500 text-center">
              You can always migrate later from the settings page
            </p>
          </>
        ) : (
          <>
            <div className="text-center">
              <div
                className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                  migrationResult.success
                    ? 'bg-green-100'
                    : 'bg-red-100'
                }`}
              >
                {migrationResult.success ? (
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>

              <h3
                className={`mt-4 text-lg font-semibold ${
                  migrationResult.success
                    ? 'text-green-900'
                    : 'text-red-900'
                }`}
              >
                {migrationResult.success
                  ? 'Migration Complete!'
                  : 'Migration Failed'}
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                {migrationResult.message}
              </p>

              {migrationResult.details && (
                <div className="mt-4 text-left bg-gray-50 p-3 rounded text-xs">
                  <p className="font-semibold mb-2">Details:</p>
                  <ul className="space-y-1">
                    <li>
                      Sessions: {migrationResult.details.sessions.migrated}{' '}
                      migrated
                      {migrationResult.details.sessions.failed > 0 &&
                        `, ${migrationResult.details.sessions.failed} failed`}
                    </li>
                    <li>
                      Players: {migrationResult.details.players.migrated}{' '}
                      migrated
                      {migrationResult.details.players.failed > 0 &&
                        `, ${migrationResult.details.players.failed} failed`}
                    </li>
                    <li>
                      Pending Stats:{' '}
                      {migrationResult.details.pendingStats.migrated} migrated
                      {migrationResult.details.pendingStats.failed > 0 &&
                        `, ${migrationResult.details.pendingStats.failed} failed`}
                    </li>
                    <li>
                      Guns: {migrationResult.details.guns.migrated} migrated
                      {migrationResult.details.guns.failed > 0 &&
                        `, ${migrationResult.details.guns.failed} failed`}
                    </li>
                  </ul>
                </div>
              )}

              {migrationResult.success && (
                <button
                  onClick={() => setShowPrompt(false)}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700"
                >
                  Continue
                </button>
              )}

              {!migrationResult.success && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleMigrate}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Retry
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
