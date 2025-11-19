/**
 * QR Scanner Component
 * Displays QR detection overlay on video feed
 */

import React, { useEffect, useRef } from 'react';

export const QRScanner = ({ videoRef, detectedQR, onStartScanning }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Start scanning when component mounts
    if (onStartScanning) {
      console.log('Invoking onStartScanning callback...');
      onStartScanning();
    }
  }, [onStartScanning]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Video feed */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* QR Detection overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {detectedQR ? (
            <>
              {/* Green border when QR detected */}
              <div className="absolute inset-0 border-4 border-green-500 animate-pulse"></div>
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                QR Code Detected
              </div>
            </>
          ) : (
            <>
              {/* Scanning frame */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-white border-dashed rounded-lg opacity-50"></div>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm">
                Position QR code in frame
              </div>
            </>
          )}
        </div>
      </div>

      {/* QR Code info */}
      {detectedQR && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-semibold">Detected Gun ID:</span> {detectedQR}
          </p>
        </div>
      )}
    </div>
  );
};
