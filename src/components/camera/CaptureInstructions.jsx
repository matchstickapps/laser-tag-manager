/**
 * Capture Instructions Component
 * Shows positioning guide for gun display
 */

import React from 'react';

export const CaptureInstructions = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">How to Capture Stats</h2>

        <div className="space-y-4 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <p>
              <strong>Position the gun display</strong> so it's clearly visible in the camera view.
              Make sure the LCD screen is well-lit and in focus.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <p>
              <strong>Include the QR code</strong> in the frame. The QR code should be attached to the gun
              and visible to the camera.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <p>
              <strong>Hold steady</strong> when you see the green border appear, indicating the QR code
              has been detected.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">
              4
            </div>
            <p>
              <strong>Click "Capture Stats"</strong> and wait 5-10 seconds for the system to analyze
              the display.
            </p>
          </div>
        </div>

        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Tip:</strong> For best results, ensure good lighting and avoid glare on the LCD screen.
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="btn-primary w-full mt-6"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};
