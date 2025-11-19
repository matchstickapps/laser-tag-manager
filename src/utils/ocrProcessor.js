/**
 * OCR Processor
 * Handles image preprocessing and Tesseract.js configuration
 * Optimized for LCD gun display with greenish background
 */

import { createWorker } from 'tesseract.js';

/**
 * Preprocess image for better OCR accuracy
 * Handles LCD display characteristics: greenish background, dark text, pixelation
 * @param {HTMLCanvasElement} canvas - Canvas with captured image
 * @returns {string} Base64 data URL of preprocessed image
 */
export const preprocessImage = (canvas) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Step 1: Convert to grayscale
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;     // R
    data[i + 1] = avg; // G
    data[i + 2] = avg; // B
  }

  // Step 2: Increase contrast (40-50% boost)
  const contrastFactor = 1.5;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = ((data[i] - 128) * contrastFactor) + 128;
    data[i + 1] = ((data[i + 1] - 128) * contrastFactor) + 128;
    data[i + 2] = ((data[i + 2] - 128) * contrastFactor) + 128;
  }

  // Step 3: Apply adaptive threshold
  // This helps with the varying LCD screen brightness
  const threshold = calculateOtsuThreshold(data);

  for (let i = 0; i < data.length; i += 4) {
    const brightness = data[i];
    const newValue = brightness > threshold ? 255 : 0;
    data[i] = newValue;
    data[i + 1] = newValue;
    data[i + 2] = newValue;
  }

  ctx.putImageData(imageData, 0, 0);

  // Return preprocessed image as base64
  return canvas.toDataURL('image/png');
};

/**
 * Calculate Otsu's threshold for adaptive binarization
 * @param {Uint8ClampedArray} data - Image pixel data
 * @returns {number} Optimal threshold value
 */
const calculateOtsuThreshold = (data) => {
  // Build histogram
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    histogram[data[i]]++;
  }

  // Total number of pixels
  const total = data.length / 4;

  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let threshold = 0;

  for (let i = 0; i < 256; i++) {
    wB += histogram[i];
    if (wB === 0) continue;

    wF = total - wB;
    if (wF === 0) break;

    sumB += i * histogram[i];

    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const variance = wB * wF * (mB - mF) * (mB - mF);

    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = i;
    }
  }

  return threshold;
};

/**
 * Apply Gaussian blur to reduce LCD pixelation
 * @param {ImageData} imageData - Image data to blur
 * @param {number} radius - Blur radius
 * @returns {ImageData} Blurred image data
 */
const applyGaussianBlur = (imageData, radius = 1) => {
  // Simple box blur approximation for performance
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const output = new Uint8ClampedArray(data);

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let r = 0, g = 0, b = 0, count = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          count++;
        }
      }

      const idx = (y * width + x) * 4;
      output[idx] = r / count;
      output[idx + 1] = g / count;
      output[idx + 2] = b / count;
    }
  }

  return new ImageData(output, width, height);
};

/**
 * Tesseract.js configuration optimized for gun display
 */
const TESSERACT_CONFIG = {
  lang: 'eng',
  // Whitelist characters that appear on the gun display
  tessedit_char_whitelist: 'HPRAEMOUTNDLISYBCT0123456789/:% ',
  // Single block of text
  tessedit_pageseg_mode: '6', // PSM.SINGLE_BLOCK
  // Use LSTM engine only
  tessedit_ocr_engine_mode: '1', // OEM.LSTM_ONLY
};

/**
 * Perform OCR on preprocessed image
 * @param {string} imageDataUrl - Base64 image data URL
 * @param {Function} onProgress - Progress callback (0-1)
 * @returns {Promise<Object>} OCR result with text and confidence
 */
export const performOCR = async (imageDataUrl, onProgress = () => {}) => {
  try {
    // Create Tesseract worker
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          onProgress(m.progress);
        }
      }
    });

    // Set parameters
    await worker.setParameters(TESSERACT_CONFIG);

    // Recognize text
    const result = await worker.recognize(imageDataUrl);

    // Clean up
    await worker.terminate();

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      lines: result.data.lines,
      words: result.data.words
    };
  } catch (error) {
    console.error('OCR failed:', error);
    throw new Error('Failed to perform OCR: ' + error.message);
  }
};

/**
 * Extract region from canvas for region-based OCR
 * @param {HTMLCanvasElement} sourceCanvas - Original canvas
 * @param {Object} region - { x, y, width, height } in percentages (0-1)
 * @returns {HTMLCanvasElement} Cropped canvas
 */
export const extractRegion = (sourceCanvas, region) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const x = sourceCanvas.width * region.x;
  const y = sourceCanvas.height * region.y;
  const width = sourceCanvas.width * region.width;
  const height = sourceCanvas.height * region.height;

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(
    sourceCanvas,
    x, y, width, height,
    0, 0, width, height
  );

  return canvas;
};

/**
 * Region definitions based on gun display layout
 * Coordinates are percentages of image dimensions (0-1)
 */
export const DISPLAY_REGIONS = {
  hp: { x: 0, y: 0, width: 0.5, height: 0.25 },        // Top-left
  ammo: { x: 0.5, y: 0, width: 0.5, height: 0.25 },    // Top-right
  reloads: { x: 0, y: 0.25, width: 0.33, height: 0.25 },// Middle-left
  tags: { x: 0.33, y: 0.25, width: 0.33, height: 0.25 },// Middle-center
  deactivations: { x: 0.66, y: 0.25, width: 0.34, height: 0.25 }, // Middle-right
  accuracy: { x: 0, y: 0.5, width: 0.4, height: 0.25 }, // Bottom-left
  team: { x: 0.8, y: 0.5, width: 0.2, height: 0.25 },   // Bottom-right
};

/**
 * Perform region-based OCR for better accuracy
 * @param {HTMLCanvasElement} canvas - Preprocessed image canvas
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Combined OCR results
 */
export const performRegionBasedOCR = async (canvas, onProgress = () => {}) => {
  const results = {};
  const regions = Object.keys(DISPLAY_REGIONS);

  for (let i = 0; i < regions.length; i++) {
    const regionName = regions[i];
    const region = DISPLAY_REGIONS[regionName];

    try {
      const regionCanvas = extractRegion(canvas, region);
      const preprocessedDataUrl = preprocessImage(regionCanvas);

      const ocrResult = await performOCR(preprocessedDataUrl, (progress) => {
        const overallProgress = (i + progress) / regions.length;
        onProgress(overallProgress);
      });

      results[regionName] = ocrResult;
    } catch (error) {
      console.error(`OCR failed for region ${regionName}:`, error);
      results[regionName] = { text: '', confidence: 0 };
    }
  }

  return results;
};

/**
 * Process complete image: preprocess + OCR + parse
 * @param {HTMLCanvasElement} canvas - Original image canvas
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Parsed stats with OCR text
 */
export const processImage = async (canvas, onProgress = () => {}) => {
  try {
    // Preprocess entire image
    onProgress(0.1);
    const preprocessedDataUrl = preprocessImage(canvas);

    // Perform OCR on full image
    onProgress(0.2);
    const ocrResult = await performOCR(preprocessedDataUrl, (p) => {
      onProgress(0.2 + p * 0.8);
    });

    onProgress(1.0);

    return {
      text: ocrResult.text,
      confidence: ocrResult.confidence,
      preprocessedImage: preprocessedDataUrl
    };
  } catch (error) {
    console.error('Image processing failed:', error);
    throw error;
  }
};
