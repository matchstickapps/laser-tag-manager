/**
 * Loading Spinner Component
 * Shows loading state with optional message and progress
 */

import React from 'react';

export const LoadingSpinner = ({ message = 'Loading...', progress = null }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>

      {message && (
        <p className="mt-4 text-gray-700 font-medium">{message}</p>
      )}

      {progress !== null && (
        <div className="mt-3 w-48">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 text-center mt-1">{Math.round(progress)}%</p>
        </div>
      )}
    </div>
  );
};
