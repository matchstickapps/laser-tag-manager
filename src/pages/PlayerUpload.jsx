/**
 * Player Upload Page
 * Allows players to scan QR codes and upload gun display stats
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatsCapture } from '../components/camera/StatsCapture';
import { ImagePreview } from '../components/camera/ImagePreview';
import { CaptureInstructions } from '../components/camera/CaptureInstructions';
import { useOCR } from '../hooks/useOCR';
import { useGame } from '../contexts/GameContext';
import { usePlayer } from '../contexts/PlayerContext';
import { usePending } from '../contexts/PendingContext';
import { compressImage } from '../utils/imageUtils';
import { parseQRCode, isValidQRCode, findOrCreateGun } from '../utils/qrCodeHandler';
import { Html5Qrcode } from 'html5-qrcode';

const PlayerUpload = () => {
  const router = useRouter();
  const { isProcessing, progress, processCanvas, reset: resetOCR } = useOCR();
  const { getActiveSession } = useGame();
  const { createPlayer, getPlayerByGunId } = usePlayer();
  const { addPendingStats } = usePending();

  const [detectedQR, setDetectedQR] = useState(null);
  const [scanner, setScanner] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [extractedStats, setExtractedStats] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const videoRef = React.useRef(null);

  // Initialize QR scanner
  useEffect(() => {
    const init = async () => {
      // Show instructions on first visit
      const hasSeenInstructions = localStorage.getItem('seenCaptureInstructions');
      if (!hasSeenInstructions) {
        setShowInstructions(true);
        localStorage.setItem('seenCaptureInstructions', 'true');
      }

      // Initialize QR scanner
      const qrScanner = new Html5Qrcode('qr-scanner-region');
      setScanner(qrScanner);

      try {
        console.log('Starting QR scanner...');
        await qrScanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            console.log('QR code detected:', decodedText);
            if (isValidQRCode(decodedText)) {
              setDetectedQR(decodedText);
            }
          },
          () => {
            // Ignore scan errors (QR not detected)
          }
        );

        // Get reference to the video element created by Html5Qrcode
        const videoElement = document.querySelector('#qr-scanner-region video');
        if (videoElement) {
          videoRef.current = videoElement;
        }
      } catch (error) {
        console.error('QR scanner error:', error);
      }
    };

    init();

    return () => {
      console.log('Stopping QR scanner...');
      if (scanner) {
        scanner.stop().catch(console.error);
      }
    };
  }, []);

  const handleCapture = async (canvas, qrCode) => {
    try {
      // Process OCR
      const result = await processCanvas(canvas);

      if (result.success) {
        // Compress image for storage
        const dataUrl = canvas.toDataURL('image/png');
        const compressed = await compressImage(dataUrl);

        setCapturedImage(compressed);
        setExtractedStats(result.data.stats);

        // Stop QR scanner while previewing
        if (scanner) {
          await scanner.stop();
        }
      } else {
        alert('Failed to process image: ' + result.error);
      }
    } catch (error) {
      console.error('Capture error:', error);
      alert('Failed to capture stats: ' + error.message);
    }
  };

  const handleSubmit = () => {
    const activeSession = getActiveSession();

    if (!activeSession) {
      alert('No active session. Please contact the manager to start a session.');
      return;
    }

    if (!detectedQR || !extractedStats || !capturedImage) {
      alert('Missing required data for submission.');
      return;
    }

    // Get or create player
    let player = getPlayerByGunId(detectedQR);

    if (!player) {
      // Create new player with default name
      const parsed = parseQRCode(detectedQR);
      const defaultName = `Player ${parsed.gunNumber}`;
      player = createPlayer(
        detectedQR,
        defaultName,
        activeSession.id,
        extractedStats.team.value
      );
    }

    // Add to pending queue
    addPendingStats(
      player.id,
      activeSession.id,
      capturedImage,
      extractedStats
    );

    setSubmitStatus('success');

    // Reset after 3 seconds
    setTimeout(() => {
      handleRetry();
      setSubmitStatus(null);
    }, 3000);
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setExtractedStats(null);
    setDetectedQR(null);
    resetOCR();

    // Restart QR scanner
    if (scanner) {
      scanner.start(
        { facingMode: 'environment' },
        { fps: 2, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (isValidQRCode(decodedText)) {
            setDetectedQR(decodedText);
          }
        },
        () => {}
      ).catch(console.error);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-600 mb-3">
            Stats Submitted!
          </h2>
          <p className="text-gray-700">
            Your stats have been sent for manager approval.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Gun Stats
          </h1>
          <p className="text-gray-600">
            Scan your gun's QR code and capture the display stats
          </p>
        </div>

        {/* Camera view or preview */}
        {!capturedImage ? (
          <div className="relative w-full max-w-2xl mx-auto">
            {/* QR Scanner region - Html5Qrcode creates video element here */}
            <div id="qr-scanner-region" className="w-full rounded-lg overflow-hidden"></div>

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
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm">
                  Position QR code in frame
                </div>
              )}
            </div>

            {/* QR Code info */}
            {detectedQR && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Detected Gun ID:</span> {detectedQR}
                </p>
              </div>
            )}

            <StatsCapture
              videoRef={videoRef}
              detectedQR={detectedQR}
              isProcessing={isProcessing}
              progress={progress}
              onCapture={handleCapture}
            />
          </div>
        ) : (
          <ImagePreview
            capturedImage={capturedImage}
            extractedStats={extractedStats}
            onSubmit={handleSubmit}
            onRetry={handleRetry}
          />
        )}

        {/* Help button */}
        <div className="text-center mt-6">
          <button
            onClick={() => setShowInstructions(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Need help? View instructions
          </button>
        </div>

        {/* Back to home */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-700 text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Instructions modal */}
      {showInstructions && (
        <CaptureInstructions onDismiss={() => setShowInstructions(false)} />
      )}
    </div>
  );
};

export default PlayerUpload;
