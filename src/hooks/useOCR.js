/**
 * useOCR Hook
 * Manages OCR processing state using Next.js API route
 */

import { useState } from 'react';
import { processCanvasWithOCR } from '../utils/ocrClient';
import { parseStats, calculateOverallConfidence } from '../utils/statsParser';

export const useOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const processCanvas = async (canvas) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      // Process image with OCR API
      const ocrResult = await processCanvasWithOCR(canvas, (p) => {
        setProgress(p * 100);
      });

      // Parse stats from OCR text
      const parsedStats = parseStats(ocrResult.text);
      const overallConfidence = calculateOverallConfidence(parsedStats);

      const finalResult = {
        ocrText: ocrResult.text,
        ocrConfidence: ocrResult.confidence,
        stats: parsedStats,
        overallConfidence,
        capturedImage: canvas.toDataURL('image/jpeg', 0.9)
      };

      setResult(finalResult);
      setIsProcessing(false);

      return {
        success: true,
        data: finalResult
      };

    } catch (err) {
      console.error('OCR processing error:', err);
      setError(err.message);
      setIsProcessing(false);

      return {
        success: false,
        error: err.message
      };
    }
  };

  const reset = () => {
    setIsProcessing(false);
    setProgress(0);
    setResult(null);
    setError(null);
  };

  return {
    isProcessing,
    progress,
    result,
    error,
    processCanvas,
    reset
  };
};
