/**
 * Stats Capture Component
 * Capture button and OCR processing
 */

import React from 'react';
import { captureFromVideo } from '../../utils/imageUtils';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const StatsCapture = ({
  videoRef,
  detectedQR,
  isProcessing,
  progress,
  onCapture
}) => {
  const handleCapture = async () => {
    console.log('Capture button clicked');
    if (!videoRef.current || !detectedQR) return;

    try {
      const canvas = captureFromVideo(videoRef.current);
      await onCapture(canvas, detectedQR);
    } catch (error) {
      console.error('Capture failed:', error);
    }
  };

  if (isProcessing) {
    return (
      <div className="mt-6">
        <LoadingSpinner
          message="Analyzing gun display..."
          progress={progress}
        />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleCapture}
        disabled={!detectedQR}
        className="btn-primary w-full text-lg py-3"
      >
        {detectedQR ? 'Capture Stats' : 'Waiting for QR Code...'}
      </button>

      <p className="text-sm text-gray-600 text-center mt-3">
        Make sure the gun display is clearly visible in the camera view
      </p>
    </div>
  );
};
