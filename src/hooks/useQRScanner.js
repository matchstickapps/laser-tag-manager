/**
 * useQRScanner Hook
 * Continuous QR code detection using html5-qrcode
 */

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export const useQRScanner = (videoElementId) => {
  const [detectedQR, setDetectedQR] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  const startScanning = async () => {
    console.log('Starting QR scanner...');
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(videoElementId);
      }

      const config = {
        fps: 2, // Scan at 2 fps to reduce CPU usage
        qrbox: { width: 250, height: 250 }
      };

      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          // QR code detected
          setDetectedQR(decodedText);
        },
        (errorMessage) => {
          // QR code not detected (ignore these errors)
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error('QR Scanner start error:', error);
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current && isScanning) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }
    } catch (error) {
      console.error('QR Scanner stop error:', error);
    }
  };

  const clearDetection = () => {
    setDetectedQR(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return {
    detectedQR,
    isScanning,
    startScanning,
    stopScanning,
    clearDetection
  };
};
