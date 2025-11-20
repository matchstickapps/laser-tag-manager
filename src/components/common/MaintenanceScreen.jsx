import React from 'react';

const MaintenanceScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl border border-gray-700">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Under Maintenance
          </h1>

          {/* Message */}
          <p className="text-gray-300 text-lg md:text-xl mb-8">
            We're currently performing scheduled maintenance to improve your experience.
          </p>

          {/* Additional Info */}
          <div className="bg-gray-900/50 rounded-lg p-6 mb-6">
            <p className="text-gray-400 text-sm md:text-base">
              Our team is working hard to get everything back up and running.
              We appreciate your patience and apologize for any inconvenience.
            </p>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2 text-yellow-500">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Maintenance in Progress</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-500 text-sm mt-8">
          Please check back shortly. Thank you for your understanding.
        </p>
      </div>
    </div>
  );
};

export default MaintenanceScreen;
